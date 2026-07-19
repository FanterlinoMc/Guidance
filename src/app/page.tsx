import { ChatWidget } from "@/features/chat-widget";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-brand">Guidance Home Services</h1>
      <p className="mt-2 text-sm text-foreground/70">Chat with our AI assistant below.</p>
      <ChatWidget />
    </main>
  );
}
