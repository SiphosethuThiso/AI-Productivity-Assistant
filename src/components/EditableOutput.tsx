import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function EditableOutput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [copied, setCopied] = useState(false);
  const [initial, setInitial] = useState(value);

  useEffect(() => {
    setInitial(value);
  }, [value === initial ? value : null]); // capture original on first mount/regen

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="p-0 overflow-hidden border-border/60">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-muted/20">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Output (editable)</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onChange(initial)} disabled={value === initial} className="h-7 gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button variant="ghost" size="sm" onClick={copy} className="h-7 gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 rounded-none min-h-[360px] font-mono text-sm resize-y focus-visible:ring-0"
      />
    </Card>
  );
}