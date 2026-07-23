import { isRTL } from "@/features/multilingual";
import { renderMarkdown } from "../logic/render-markdown";
import type { ChatMessage } from "../logic/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      dir={isRTL(message.content) ? "rtl" : "ltr"}
      className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
        isUser
          ? "ml-auto rounded-2xl rounded-br-md bg-brand text-white"
          : "mr-auto rounded-2xl rounded-bl-md bg-white text-gray-900"
      }`}
    >
      {renderMarkdown(message.content)}
    </div>
  );
}
