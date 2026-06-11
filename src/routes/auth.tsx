import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Кіру — TazaEl" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { lang } = useLanguage();
  const L = lang === "kk";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setError(e?.message ?? "Қате");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/30 px-4">
      <div className="w-full max-w-md bg-background border border-foreground/10 rounded-3xl p-8 shadow-xl">
        <Link to="/" className="text-xs text-foreground/50 hover:text-primary">← {L ? "Басты бетке" : "На главную"}</Link>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <div className="size-10 rounded-2xl bg-primary grid place-items-center text-primary-foreground"><Lock className="size-5" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">{L ? "Әкімдік панелі" : "Панель акимата"}</h1>
            <p className="text-xs text-foreground/50">{L ? "Тек қызметкерлерге арналған" : "Только для сотрудников"}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3 mt-6">
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
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-foreground text-background py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? (L ? "Кіру" : "Войти") : (L ? "Тіркелу" : "Регистрация")}
          </button>
        </form>

        <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          className="mt-4 text-xs text-foreground/60 hover:text-primary w-full text-center">
          {mode === "signin"
            ? (L ? "Аккаунт жоқ па? Тіркелу" : "Нет аккаунта? Регистрация")
            : (L ? "Аккаунт бар. Кіру" : "Уже есть аккаунт. Войти")}
        </button>

        <p className="mt-6 text-[11px] text-foreground/40 leading-relaxed text-center">
          {L
            ? "Алғаш тіркелген қолданушы автоматты түрде әкімші болады. Қалғандарына әкімші рұқсат береді."
            : "Первый зарегистрированный пользователь автоматически становится администратором."}
        </p>
      </div>
    </div>
  );
}