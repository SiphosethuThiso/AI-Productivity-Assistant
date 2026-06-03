import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Mail, FileText, ListTodo, Search, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { AIDisclaimer } from "@/components/AIDisclaimer";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workmate AI" },
      { name: "description", content: "Your AI-powered workplace productivity hub." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { url: "/email", title: "Smart Email Generator", desc: "Draft polished emails in seconds with the right tone.", icon: Mail },
  { url: "/summarize", title: "Meeting Notes Summarizer", desc: "Turn raw notes into action items and decisions.", icon: FileText },
  { url: "/planner", title: "AI Task Planner", desc: "Break goals into prioritized milestones and tasks.", icon: ListTodo },
  { url: "/research", title: "AI Research Assistant", desc: "Get structured briefings on any topic.", icon: Search },
  { url: "/chat", title: "AI Chatbot", desc: "Open-ended assistant for anything workplace-related.", icon: MessageSquare },
] as const;

function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 px-6 sm:px-10 py-10" style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary-glow mb-3">
          <Sparkles className="h-3.5 w-3.5" /> AI Workplace Suite
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
          Automate the busywork. <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>Focus on what matters.</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Five AI tools and a conversational assistant — designed for professionals who ship.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link key={t.url} to={t.url}>
            <Card className="group h-full p-6 border-border/60 hover:border-primary/50 transition-all hover:-translate-y-0.5" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                <t.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg tracking-tight">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{t.desc}</p>
              <div className="flex items-center gap-1.5 text-sm text-primary-glow mt-4 group-hover:gap-2.5 transition-all">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <AIDisclaimer />
    </div>
  );
}