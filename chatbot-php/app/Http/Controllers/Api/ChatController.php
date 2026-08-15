<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Chat\ChatErrorResponder;
use App\Services\Chat\ChatRequestParser;
use App\Services\Chat\ClaudeClient;
use App\Services\Chat\ConversationHistoryCapper;
use App\Services\Chat\SseStreamBuilder;
use App\Services\Chat\SuggestionExtractor;
use App\Services\Cors\CorsResolver;
use App\Services\Guardrails\GuardrailGateway;
use App\Services\Leads\CaptureLeadFromChatTurn;
use App\Services\RateLimit\RateLimiter;
use App\Services\Retrieval\RetrieveContextForSession;
use App\Services\Session\SessionResolver;
use App\Services\SessionTranscript\TranscriptLogger;
use App\Services\SystemPrompt\SystemPromptBuilder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

final class ChatController extends Controller
{
    private const DEFAULT_REFUSAL = 'I can only help with questions about Guidance Home Services financing.';

    /** @var CorsResolver */
    private $cors;

    /** @var SessionResolver */
    private $sessionResolver;

    /** @var RateLimiter */
    private $rateLimiter;

    /** @var ChatRequestParser */
    private $requestParser;

    /** @var TranscriptLogger */
    private $transcriptLogger;

    /** @var GuardrailGateway */
    private $guardrails;

    /** @var CaptureLeadFromChatTurn */
    private $captureLead;

    /** @var RetrieveContextForSession */
    private $retrieveContext;

    /** @var SystemPromptBuilder */
    private $systemPrompt;

    /** @var ConversationHistoryCapper */
    private $historyCapper;

    /** @var ClaudeClient */
    private $claude;

    /** @var SuggestionExtractor */
    private $suggestionExtractor;

    /** @var SseStreamBuilder */
    private $sseBuilder;

    /** @var ChatErrorResponder */
    private $errorResponder;

    public function __construct(
        CorsResolver $cors,
        SessionResolver $sessionResolver,
        RateLimiter $rateLimiter,
        ChatRequestParser $requestParser,
        TranscriptLogger $transcriptLogger,
        GuardrailGateway $guardrails,
        CaptureLeadFromChatTurn $captureLead,
        RetrieveContextForSession $retrieveContext,
        SystemPromptBuilder $systemPrompt,
        ConversationHistoryCapper $historyCapper,
        ClaudeClient $claude,
        SuggestionExtractor $suggestionExtractor,
        SseStreamBuilder $sseBuilder,
        ChatErrorResponder $errorResponder
    ) {
        $this->cors = $cors;
        $this->sessionResolver = $sessionResolver;
        $this->rateLimiter = $rateLimiter;
        $this->requestParser = $requestParser;
        $this->transcriptLogger = $transcriptLogger;
        $this->guardrails = $guardrails;
        $this->captureLead = $captureLead;
        $this->retrieveContext = $retrieveContext;
        $this->systemPrompt = $systemPrompt;
        $this->historyCapper = $historyCapper;
        $this->claude = $claude;
        $this->suggestionExtractor = $suggestionExtractor;
        $this->sseBuilder = $sseBuilder;
        $this->errorResponder = $errorResponder;
    }

    public function options(Request $request): Response
    {
        return response('', 204)->withHeaders($this->corsHeadersFor($request));
    }

    public function post(Request $request): Response
    {
        $corsHeaders = $this->corsHeadersFor($request);
        $session = $this->sessionResolver->resolve($request);
        $sessionId = $session['sessionId'];

        try {
            $this->rateLimiter->enforce($request->ip());

            $parsed = $this->requestParser->parse($request->json()->all());
            $messages = $parsed['messages'];
            $latestUserMessage = $messages[count($messages) - 1]['content'];
            $this->transcriptLogger->log($sessionId, 'user', $latestUserMessage);

            $inputResult = $this->guardrails->runInputGuardrail($latestUserMessage, $sessionId);
            if (! $inputResult->allowed) {
                return $this->sseResponse($sessionId, $inputResult->refusalMessage ?? self::DEFAULT_REFUSAL, [], $corsHeaders, $session['cookie']);
            }

            // Only a message that passed the input guardrail counts as real engagement -- see
            // CaptureLeadFromChatTurn's own comment for the track=homebuyer default it applies.
            $this->captureLead->handle($sessionId, $latestUserMessage);

            $retrievedChunks = $this->retrieveContext->retrieve($sessionId, $latestUserMessage);
            $systemMessage = $this->systemPrompt->build($retrievedChunks);
            $cappedHistory = $this->historyCapper->cap($messages, config('chat.max_history_tokens'));

            $replyText = $this->claude->reply($systemMessage, $cappedHistory);
            $extracted = $this->suggestionExtractor->extract($replyText);

            $outputResult = $this->guardrails->runOutputGuardrail($extracted['text'], $sessionId, $retrievedChunks);
            $finalText = $outputResult->allowed ? $extracted['text'] : ($outputResult->refusalMessage ?? self::DEFAULT_REFUSAL);
            // No follow-up chips on a guardrail-blocked reply -- the model's suggestions were
            // written for the reply it intended to give, not the refusal that replaced it.
            $finalSuggestions = $outputResult->allowed ? $extracted['suggestions'] : [];

            return $this->sseResponse($sessionId, $finalText, $finalSuggestions, $corsHeaders, $session['cookie']);
        } catch (Throwable $error) {
            $response = $this->errorResponder->respond($error);
            foreach ($corsHeaders as $name => $value) {
                $response->headers->set($name, $value);
            }
            if ($session['cookie'] !== null) {
                $response->headers->setCookie($session['cookie']);
            }

            return $response;
        }
    }

    /**
     * @return array<string, string>
     */
    private function corsHeadersFor(Request $request): array
    {
        $origin = $this->cors->resolveOrigin($request->header('Origin'), $this->cors->allowedOrigins());

        return $this->cors->buildHeaders($origin);
    }

    /**
     * @param string[] $suggestions
     * @param array<string, string> $corsHeaders
     * @param \Symfony\Component\HttpFoundation\Cookie|null $cookie
     */
    private function sseResponse(string $sessionId, string $text, array $suggestions, array $corsHeaders, $cookie): Response
    {
        $this->transcriptLogger->log($sessionId, 'assistant', $text);

        $body = $this->sseBuilder->build($this->sseBuilder->chunkTextForStreaming($text), $suggestions);

        $response = response($body, 200)->withHeaders(array_merge([
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ], $corsHeaders));

        if ($cookie !== null) {
            $response->headers->setCookie($cookie);
        }

        return $response;
    }
}
