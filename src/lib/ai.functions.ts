import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MODEL = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return import("./ai-gateway.server").then((m) => m.createLovableAiGatewayProvider(key));
}

async function generate(system: string, prompt: string) {
  const { generateText } = await import("ai");
  const gateway = await getGateway();
  const { text } = await generateText({
    model: gateway(MODEL),
    system,
    prompt,
  });
  return text;
}

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      recipient: z.string().max(200).optional().default(""),
      purpose: z.string().min(1).max(2000),
      tone: z.string().max(50).optional().default("professional"),
      keyPoints: z.string().max(2000).optional().default(""),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const system =
      "You are a professional workplace email writer. Write clear, concise, well-structured emails. Output ONLY the email (Subject line on first line as 'Subject: ...', then a blank line, then the body). Do not include explanations or markdown fences.";
    const prompt = `Write an email.
Recipient: ${data.recipient || "(unspecified)"}
Tone: ${data.tone}
Purpose: ${data.purpose}
Key points to include:
${data.keyPoints || "(none)"}`;
    return { content: await generate(system, prompt) };
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ notes: z.string().min(10).max(50000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const system =
      "You are an executive assistant. Summarize meeting notes into a crisp brief with these markdown sections: ## Summary, ## Key Decisions, ## Action Items (as a checklist with owner if mentioned), ## Open Questions, ## Next Steps. Be concise and factual.";
    return { content: await generate(system, data.notes) };
  });

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      goal: z.string().min(1).max(2000),
      deadline: z.string().max(100).optional().default(""),
      context: z.string().max(2000).optional().default(""),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const system =
      "You are an AI productivity planner. Break a goal into a clear, prioritized action plan. Use markdown: ## Plan Overview, ## Milestones (numbered), ## Task Breakdown (checklist grouped by milestone with estimated effort), ## Risks & Mitigations. Be realistic and structured.";
    const prompt = `Goal: ${data.goal}\nDeadline: ${data.deadline || "(flexible)"}\nContext: ${data.context || "(none)"}`;
    return { content: await generate(system, prompt) };
  });

export const researchTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      topic: z.string().min(1).max(2000),
      depth: z.enum(["overview", "deep"]).optional().default("overview"),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const system =
      "You are an AI research assistant. Produce a structured briefing in markdown: ## Executive Summary, ## Key Concepts, ## Current Landscape, ## Notable Players / Examples, ## Considerations & Trade-offs, ## Suggested Next Steps. Note that you may not have real-time data; flag uncertainty where relevant.";
    const prompt = `Topic: ${data.topic}\nDepth: ${data.depth}`;
    return { content: await generate(system, prompt) };
  });

export const chatComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      threadId: z.string().uuid(),
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string().min(1).max(20000),
          }),
        )
        .min(1)
        .max(100),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify thread belongs to user
    const { data: thread, error: tErr } = await supabase
      .from("chat_threads")
      .select("id, title")
      .eq("id", data.threadId)
      .maybeSingle();
    if (tErr || !thread) throw new Error("Thread not found");

    const system =
      "You are an AI Workplace Productivity Assistant. Help with emails, meeting notes, planning, research, and general workplace questions. Be concise, helpful, and well-structured. Use markdown when it improves clarity.";
    const { generateText } = await import("ai");
    const gateway = await getGateway();
    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    // Persist
    const { data: inserted, error: iErr } = await supabase
      .from("chat_messages")
      .insert([
        ...(lastUser
          ? [{ thread_id: data.threadId, user_id: userId, role: "user", content: lastUser.content }]
          : []),
        { thread_id: data.threadId, user_id: userId, role: "assistant", content: text },
      ])
      .select();
    if (iErr) throw new Error(iErr.message);

    // Update thread timestamp + auto-title if still default
    const updates: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
    if (thread.title === "New chat" && lastUser) {
      updates.title = lastUser.content.slice(0, 60);
    }
    await supabase.from("chat_threads").update(updates).eq("id", data.threadId);

    return { reply: text, inserted };
  });