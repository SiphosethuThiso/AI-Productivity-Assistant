import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { researchTopic } from "@/lib/ai.functions";
import { ToolPageShell } from "@/components/ToolPageShell";
import { EditableOutput } from "@/components/EditableOutput";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Workmate AI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"overview" | "deep">("overview");
  const [output, setOutput] = useState("");

  const run = async () => {
    if (!topic.trim()) return toast.error("Enter a topic to research");
    setLoading(true);
    try {
      const r = await fn({ data: { topic, depth } });
      setOutput(r.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageShell icon={<Search className="h-5 w-5 text-primary-foreground" />} title="AI Research Assistant" subtitle="Get a structured briefing on any topic — fast.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4 border-border/60">
          <div className="space-y-2">
            <Label>Topic or question</Label>
            <Textarea rows={5} placeholder="e.g. Compare RAG vs fine-tuning for customer support bots" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={(v) => setDepth(v as "overview" | "deep")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="deep">Deep dive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={run} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Research
          </Button>
          <p className="text-xs text-muted-foreground">
            Note: This assistant doesn't browse the web. Treat output as a starting point, not a citation.
          </p>
        </Card>
        <EditableOutput value={output} onChange={setOutput} placeholder="Your briefing will appear here…" />
      </div>
    </ToolPageShell>
  );
}