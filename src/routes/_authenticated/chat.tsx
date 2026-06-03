import { createFileRoute, Outlet, useNavigate, useParams, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Thread = { id: string; title: string; updated_at: string };

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Chat — Workmate AI" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const activeId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    if (error) return toast.error(error.message);
    setThreads(data ?? []);
    setLoading(false);
    return data ?? [];
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const newThread = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: u.user.id, title: "New chat" })
      .select("id,title,updated_at")
      .single();
    if (error) return toast.error(error.message);
    setThreads((t) => [data, ...t]);
    navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  };

  const removeThread = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setThreads((t) => t.filter((x) => x.id !== id));
    if (activeId === id) navigate({ to: "/chat" });
  };

  // Auto-create or pick first thread when landing on /chat
  useEffect(() => {
    if (loading) return;
    if (pathname === "/chat") {
      if (threads[0]) navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
      else newThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, pathname, threads.length]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <aside className="w-64 border-r border-border/60 flex flex-col bg-sidebar/40">
        <div className="p-3 border-b border-border/60">
          <Button onClick={newThread} className="w-full gap-2" size="sm">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && <div className="text-xs text-muted-foreground p-2">Loading…</div>}
          {!loading && threads.length === 0 && (
            <div className="text-xs text-muted-foreground p-2">No conversations yet</div>
          )}
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors",
                activeId === t.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50",
              )}
            >
              <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{t.title || "Untitled"}</span>
              </Link>
              <button
                onClick={(e) => removeThread(t.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                aria-label="Delete thread"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
