import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { chatComplete } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Msg = { id?: string; role: "user" | "assistant" | "system"; content: string };

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = useParams({ from: "/_authenticated/chat/$threadId" });
  const send = useServerFn(chatComplete);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHydrated(false);
    setMessages([]);
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id,role,content")
        .eq("thread_id", threadId)
        .order("created_at");
      if (error) toast.error(error.message);
      else setMessages((data ?? []) as Msg[]);
      setHydrated(true);
      inputRef.current?.focus();
    })();
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await send({ data: { threadId, messages: next.map(({ role, content }) => ({ role, content })) } });
      setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
      setMessages(messages); // rollback
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div key={threadId} className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {hydrated && messages.length === 0 && (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">How can I help today?</h2>
              <p className="text-sm text-muted-foreground mt-2">Ask about emails, planning, summarizing, research, or anything workplace-related.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <MessageBubble key={m.id ?? i} msg={m} />
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <Avatar role="assistant" />
              <div className="text-sm text-muted-foreground pt-1.5 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={submit} className="border-t border-border/60 bg-background/80 backdrop-blur p-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message Workmate AI…  (Shift+Enter for newline)"
            rows={1}
            className="min-h-[48px] max-h-40 resize-none"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-12 w-12 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
          AI can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" | "system" }) {
  const isUser = role === "user";
  return (
    <div
      className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", isUser ? "bg-secondary" : "")}
      style={!isUser ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" } : undefined}
    >
      {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary-foreground" />}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <Avatar role={msg.role} />
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap break-words",
          isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border/60",
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}