import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, HeartHandshake } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { upsertVolunteerProfile, getMyVolunteerProfile } from "@/lib/volunteers.functions";

export const Route = createFileRoute("/volunteer-auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Волонтер тіркелуі — TazaEl" }] }),
  component: VolunteerAuthPage,
});

function VolunteerAuthPage() {
  const { lang } = useLanguage();
  const L = lang === "kk";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  const upsertFn = useServerFn(upsertVolunteerProfile);
  const getProfileFn = useServerFn(getMyVolunteerProfile);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      try {
        const prof = await getProfileFn();
        if (prof) navigate({ to: "/volunteers" });
        else setNeedsProfile(true);
      } catch {/* ignore */}
    })();
  }, [getProfileFn, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (mode === "signup" && !needsProfile) {
        if (fullName.trim().length < 2) throw new Error(L ? "Аты-жөніңізді жазыңыз" : "Укажите имя");
        const { error: sErr } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/volunteers` },
        });
        if (sErr) throw sErr;
        // session is created immediately (email confirm off by default)
        await upsertFn({ data: { full_name: fullName.trim(), phone: phone || null, city: city || null, about: about || null } });
        navigate({ to: "/volunteers" });
      } else if (mode === "signin" && !needsProfile) {
        const { error: sErr } = await supabase.auth.signInWithPassword({ email, password });
        if (sErr) throw sErr;
        const prof = await getProfileFn();
        if (!prof) {
          setNeedsProfile(true);
        } else {
          navigate({ to: "/volunteers" });
        }
      } else if (needsProfile) {
        if (fullName.trim().length < 2) throw new Error(L ? "Аты-жөніңізді жазыңыз" : "Укажите имя");
        await upsertFn({ data: { full_name: fullName.trim(), phone: phone || null, city: city || null, about: about || null } });
        navigate({ to: "/volunteers" });
      }
    } catch (e: any) {
      setError(e?.message ?? "Қате");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/30 px-4 py-10">
      <div className="w-full max-w-md bg-background border border-foreground/10 rounded-3xl p-8 shadow-xl">
        <Link to="/volunteers" className="text-xs text-foreground/50 hover:text-primary">← {L ? "Волонтерлерге қайту" : "К волонтёрам"}</Link>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <div className="size-10 rounded-2xl bg-emerald-500 grid place-items-center text-white"><HeartHandshake className="size-5" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">{L ? "Волонтер тіркелуі" : "Регистрация волонтёра"}</h1>
            <p className="text-xs text-foreground/50">{L ? "Топтарға қосылу және қолдау көрсету үшін" : "Чтобы вступать в группы и поддерживать инициативы"}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3 mt-6">
          {!needsProfile && (
            <>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{L ? "Құпиясөз" : "Пароль"}</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
            </>
          )}

          {(mode === "signup" || needsProfile) && (
            <>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{L ? "Аты-жөні" : "Имя и фамилия"}</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{L ? "Телефон" : "Телефон"}</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7…"
                    className="mt-1 w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{L ? "Қала" : "Город"}</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={L ? "Ақтау" : "Актау"}
                    className="mt-1 w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{L ? "Өзіңіз туралы" : "О себе"}</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3}
                  className="mt-1 w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {needsProfile
              ? (L ? "Профильді сақтау" : "Сохранить профиль")
              : mode === "signin"
                ? (L ? "Кіру" : "Войти")
                : (L ? "Волонтер ретінде тіркелу" : "Зарегистрироваться как волонтёр")}
          </button>
        </form>

        {!needsProfile && (
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="mt-4 text-xs text-foreground/60 hover:text-primary w-full text-center">
            {mode === "signin"
              ? (L ? "Аккаунт жоқ па? Волонтер болып тіркелу" : "Нет аккаунта? Стать волонтёром")
              : (L ? "Аккаунт бар. Кіру" : "Уже есть аккаунт. Войти")}
          </button>
        )}

        <p className="mt-6 text-[11px] text-foreground/40 leading-relaxed text-center">
          {L
            ? "Волонтерлер тіркелуі әкімдік панелінен бөлек жүргізіледі."
            : "Регистрация волонтёров отделена от панели акимата."}
        </p>
      </div>
    </div>
  );
}