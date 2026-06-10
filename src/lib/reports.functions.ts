import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CATEGORIES = [
  "illegal_dump",
  "oil_spill",
  "water_shortage",
  "air_pollution",
  "radioactive",
  "sea_pollution",
  "dead_wildlife",
  "other",
] as const;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["new", "in_review", "in_progress", "resolved", "rejected"] as const;

const CreateInput = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  location_name: z.string().min(2).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  category: z.enum(CATEGORIES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  reporter_name: z.string().max(120).optional().nullable(),
  reporter_contact: z.string().max(200).optional().nullable(),
  image_data: z.string().max(1_500_000).optional().nullable(),
});

export const createReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // AI classify + summarize
    let aiCategory = data.category ?? "other";
    let aiSeverity = data.severity ?? "medium";
    let aiSummary: string | null = null;
    let aiRecommendation: string | null = null;

    const apiKey = process.env.LOVABLE_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "raw",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content:
                  "Маңғыстау облысының экологиялық репорттарын талдайтын көмекшісің. Тек JSON қайтар, басқа мәтін жазба.",
              },
              {
                role: "user",
                content: `Репорт:\nТақырып: ${data.title}\nСипаттама: ${data.description}\nОрын: ${data.location_name}\n\nҚайтар JSON: {\"category\":\"illegal_dump|oil_spill|water_shortage|air_pollution|radioactive|sea_pollution|dead_wildlife|other\",\"severity\":\"low|medium|high|critical\",\"summary\":\"1-2 сөйлем қазақша түйін\",\"recommendation\":\"әкімдікке нақты ұсыныс, 1-2 сөйлем қазақша\"}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (res.ok) {
          const j = await res.json();
          const raw = j.choices?.[0]?.message?.content ?? "{}";
          const parsed = JSON.parse(raw);
          if (CATEGORIES.includes(parsed.category)) aiCategory = parsed.category;
          if (SEVERITIES.includes(parsed.severity)) aiSeverity = parsed.severity;
          aiSummary = parsed.summary ?? null;
          aiRecommendation = parsed.recommendation ?? null;
        }
      } catch (e) {
        console.error("AI classify failed", e);
      }
    }

    const { data: row, error } = await supabaseAdmin
      .from("eco_reports")
      .insert({
        title: data.title,
        description: data.description,
        location_name: data.location_name,
        lat: data.lat,
        lng: data.lng,
        category: aiCategory,
        severity: aiSeverity,
        reporter_name: data.reporter_name ?? null,
        reporter_contact: data.reporter_contact ?? null,
        ai_summary: aiSummary,
        ai_recommendation: aiRecommendation,
        image_url: data.image_data ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listReports = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("eco_reports")
    .select("id,category,severity,status,title,description,location_name,lat,lng,ai_summary,ai_recommendation,image_url,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return data;
});

const StatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES),
});
export const updateReportStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => StatusInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("eco_reports")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const AskInput = z.object({ question: z.string().min(2).max(500) });
export const askEcoAdvisor = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AskInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI key жоқ");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "raw",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Сен — Маңғыстау облысының экологиялық кеңесшісісің. Облыс мәселелері: ашық полигондар, Қошқар-Ата уыты, мұнай төгілуі, Каспий ластануы, ауыз су тапшылығы (23000 м³/тәу), Каспий итбалықтары. Қазақ тілінде, нақты әрі қысқа жауап бер (3-5 сөйлем).",
          },
          { role: "user", content: data.question },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Сұраулар лимитіне жеттіңіз, кейінірек қайталаңыз");
    if (res.status === 402) throw new Error("AI несиесі таусылды");
    if (!res.ok) throw new Error("AI қатесі");
    const j = await res.json();
    return { answer: j.choices?.[0]?.message?.content ?? "Жауап алынбады" };
  });