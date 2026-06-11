import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GroupId = z.object({ group_id: z.string().min(1).max(64) });

export const listVolunteerStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: members, error: mErr }, { data: dons, error: dErr }] = await Promise.all([
    supabaseAdmin.from("volunteer_memberships").select("group_id"),
    supabaseAdmin.from("donations").select("fund_id, amount"),
  ]);
  if (mErr) throw new Error(mErr.message);
  if (dErr) throw new Error(dErr.message);
  const groupCounts: Record<string, number> = {};
  (members ?? []).forEach((r: any) => { groupCounts[r.group_id] = (groupCounts[r.group_id] ?? 0) + 1; });
  const fundRaised: Record<string, number> = {};
  (dons ?? []).forEach((r: any) => { fundRaised[r.fund_id] = (fundRaised[r.fund_id] ?? 0) + (r.amount ?? 0); });
  return { groupCounts, fundRaised };
});

export const listMyMemberships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("volunteer_memberships")
      .select("group_id")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => r.group_id as string);
  });

export const joinGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GroupId.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("volunteer_memberships")
      .insert({ user_id: context.userId, group_id: data.group_id });
    if (error && !error.message.toLowerCase().includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const leaveGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GroupId.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("volunteer_memberships")
      .delete()
      .eq("user_id", context.userId)
      .eq("group_id", data.group_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const DonateInput = z.object({
  fund_id: z.string().min(1).max(64),
  amount: z.number().int().positive().max(10_000_000),
});

export const createDonation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DonateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("donations")
      .insert({ user_id: context.userId, fund_id: data.fund_id, amount: data.amount });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const ProfileInput = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  about: z.string().trim().max(500).optional().nullable(),
});

export const getMyVolunteerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("volunteer_profiles")
      .select("id, full_name, phone, city, about")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const upsertVolunteerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProfileInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("volunteer_profiles")
      .upsert(
        { user_id: context.userId, ...data },
        { onConflict: "user_id" }
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });