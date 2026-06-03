import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { ToolPageShell } from "@/components/ToolPageShell";
import { EditableOutput } from "@/components/EditableOutput";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/summarize")({
  head: () => ({ meta: [{ title: "Notes Summarizer — Workmate AI" }] }),
  component: SummarizePage,
});

function SummarizePage() {
  const fn = useServerFn(summarizeMeeting);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");

  const run = async () => {
    if (notes.trim().length < 10) return toast.error("Paste at least a few sentences of notes");
    setLoading(true);
    try {
      const r = await fn({ data: { notes } });
      setOutput(r.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageShell icon={<FileText className="h-5 w-5 text-primary-foreground" />} title="Meeting Notes Summarizer" subtitle="Paste raw notes — get decisions, action items, and next steps.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4 border-border/60">
          <div className="space-y-2">
            <Label>Meeting notes / transcript</Label>
            <Textarea rows={18} placeholder="Paste your raw notes, bullet points, or transcript…" value={notes} onChange={(e) => setNotes(e.target.value)} className="font-mono text-sm" />
          </div>
          <Button onClick={run} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Summarize
          </Button>
        </Card>
        <EditableOutput value={output} onChange={setOutput} placeholder="Structured summary will appear here…" />
      </div>
    </ToolPageShell>
  );
}