import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { ToolPageShell } from "@/components/ToolPageShell";
import { EditableOutput } from "@/components/EditableOutput";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Email Generator — Workmate AI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("professional");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");

  const generate = async () => {
    if (!purpose.trim()) return toast.error("Tell the AI what the email is about");
    setLoading(true);
    try {
      const r = await fn({ data: { recipient, tone, purpose, keyPoints } });
      setOutput(r.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageShell icon={<Mail className="h-5 w-5 text-primary-foreground" />} title="Smart Email Generator" subtitle="Describe what you need — get a polished, ready-to-send draft.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4 border-border/60">
          <div className="space-y-2">
            <Label>Recipient (optional)</Label>
            <Input placeholder="e.g. Manager, Client, Sarah from Design" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="concise">Concise & direct</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="apologetic">Apologetic</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Purpose / context</Label>
            <Textarea rows={4} placeholder="What is this email about? What outcome do you want?" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Key points to include (optional)</Label>
            <Textarea rows={4} placeholder="Bullet points, dates, links, names…" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate email
          </Button>
        </Card>
        <EditableOutput value={output} onChange={setOutput} placeholder="Your draft will appear here…" />
      </div>
    </ToolPageShell>
  );
}