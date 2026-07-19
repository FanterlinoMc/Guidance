import { isRTL } from "@/features/multilingual";
import type { ChatMessage } from "../logic/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      dir={isRTL(message.content) ? "rtl" : "ltr"}
      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
        isUser ? "ml-auto bg-brand text-white" : "mr-auto bg-gray-100 text-gray-900"
      }`}
    >
      {message.content}
    </div>
  );
}
