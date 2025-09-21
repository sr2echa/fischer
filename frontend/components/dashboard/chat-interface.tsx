"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Application {
  id: string;
  company_name: string;
  // ... other properties (only using what's needed for chat)
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  application: Application;
}

export function ChatInterface({ application }: ChatInterfaceProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isWaitingForResponse) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);
    setIsWaitingForResponse(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Based on ${
          application.company_name
        }'s documents and data, I can help you analyze their ${
          chatInput.toLowerCase().includes("revenue")
            ? "revenue model and financial projections"
            : chatInput.toLowerCase().includes("team")
            ? "founding team background and experience"
            : "business model and market opportunity"
        }. What specific aspect would you like me to dive deeper into?`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      setIsWaitingForResponse(false);
    }, 1500);
  };

  const clearMessages = () => {
    setChatMessages([]);
    setIsWaitingForResponse(false);
  };

  return (
    <div className="bg-accent/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex-shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-mono font-medium text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI Analyst Chat
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about {application.company_name}
          </p>
        </div>
        <Button
          onClick={clearMessages}
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={chatMessages.length === 0}
        >
          Clear
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-full">
        <AnimatePresence>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border/30"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-background border border-border/30 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        {chatMessages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation about this startup</p>
            <p className="text-sm mt-2">
              Ask about financials, team, market, or any other aspect
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this startup..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !isWaitingForResponse && sendChatMessage()
            }
            className="bg-background border-border/30"
            disabled={isWaitingForResponse}
          />
          <Button
            onClick={sendChatMessage}
            size="sm"
            disabled={!chatInput.trim() || isWaitingForResponse}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
