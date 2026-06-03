import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai.functions";
import { ToolPageShell } from "@/components/ToolPageShell";
import { EditableOutput } from "@/components/EditableOutput";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ListTodo, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: "Task Planner — Workmate AI" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [context, setContext] = useState("");

  const run = async () => {
    if (!goal.trim()) return toast.error("Describe your goal");
    setLoading(true);
    try {
      const r = await fn({ data: { goal, deadline, context } });
      setOutput(r.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageShell icon={<ListTodo className="h-5 w-5 text-primary-foreground" />} title="AI Task Planner" subtitle="Turn ambitious goals into a clear, milestone-based action plan.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4 border-border/60">
          <div className="space-y-2">
            <Label>Goal</Label>
            <Textarea rows={3} placeholder="e.g. Launch new pricing page by end of quarter" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Deadline (optional)</Label>
            <Input placeholder="e.g. June 30 or 3 weeks" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Context / constraints (optional)</Label>
            <Textarea rows={5} placeholder="Team size, dependencies, blockers, scope…" value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
          <Button onClick={run} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate plan
          </Button>
        </Card>
        <EditableOutput value={output} onChange={setOutput} placeholder="Your action plan will appear here…" />
      </div>
    </ToolPageShell>
  );
}