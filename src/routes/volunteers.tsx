import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MangystauNav } from "@/components/MangystauNav";
import { useLanguage } from "@/context/LanguageContext";
import { Users, Leaf, Waves, Trash2, Sprout, HandHeart, X, ArrowRight, CheckCircle2, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  listVolunteerStats,
  listMyMemberships,
  joinGroup,
  leaveGroup,
  createDonation,
} from "@/lib/volunteers.functions";

export const Route = createFileRoute("/volunteers")({
  head: () => ({
    meta: [
      { title: "Волонтерлер — TazaEl Mangystau" },
      { name: "description", content: "Маңғыстау облысының экологиялық волонтерлік топтары, жобалары мен қайырымдылық бастамалары." },
      { property: "og:title", content: "Волонтерлер — TazaEl Mangystau" },
      { property: "og:description", content: "Топтарға қосылыңыз, эко-жобаларды қолдаңыз, Маңғыстау табиғатын бірге сақтайық." },
    ],
  }),
  component: VolunteersPage,
});

type Group = {
  id: string;
  icon: any;
  name: { kk: string; ru: string };
  goal: { kk: string; ru: string };
  members: number;
  city: { kk: string; ru: string };
  works: { kk: string; ru: string }[];
  participants: string[];
};

type Project = {
  id: string;
  cover: string;
  title: { kk: string; ru: string };
  date: string;
  place: { kk: string; ru: string };
  result: { kk: string; ru: string };
  photos: string[];
  done: { kk: string; ru: string }[];
};

type Fund = {
  id: string;
  emoji: string;
  title: { kk: string; ru: string };
  goal_text: { kk: string; ru: string };
  target: number; // KZT
  raised: number;
};

const GROUPS: Group[] = [
  {
    id: "taza-kaspii",
    icon: Waves,
    name: { kk: "Таза Каспий", ru: "Чистый Каспий" },
    goal: { kk: "Каспий жағалауын тұрақты түрде тазалап, теңіз экожүйесін қорғау.", ru: "Регулярная очистка побережья Каспия и защита морской экосистемы." },
    members: 184,
    city: { kk: "Ақтау", ru: "Актау" },
    works: [
      { kk: "Айына 2 рет жағалау тазалау акциясы", ru: "Уборка побережья 2 раза в месяц" },
      { kk: "Итбалықтарды бақылау және санақ", ru: "Мониторинг и учёт каспийских тюленей" },
      { kk: "Мұнай төгілуі болған кезде шұғыл шығу", ru: "Экстренный выезд при разливах нефти" },
    ],
    participants: ["А", "Н", "Д", "Е", "Б", "С"],
  },
  {
    id: "kok-mangystau",
    icon: Sprout,
    name: { kk: "Көк Маңғыстау", ru: "Зелёный Мангистау" },
    goal: { kk: "Қалаларда ағаш отырғызу, көгалдандыру және тамшылатып суару жүйелерін енгізу.", ru: "Озеленение городов, посадка деревьев и капельный полив." },
    members: 96,
    city: { kk: "Ақтау · Жаңаөзен", ru: "Актау · Жанаозен" },
    works: [
      { kk: "Жыл сайын 1000+ ағаш отырғызу", ru: "Высадка 1000+ деревьев ежегодно" },
      { kk: "Мектеп ауласын көгалдандыру", ru: "Озеленение школьных дворов" },
      { kk: "Тамшылатып суару жүйесін орнату", ru: "Установка систем капельного полива" },
    ],
    participants: ["М", "А", "Ж", "Қ", "Р"],
  },
  {
    id: "eco-patrol",
    icon: Trash2,
    name: { kk: "Эко-Патруль", ru: "Эко-Патруль" },
    goal: { kk: "Заңсыз полигондарды анықтап, қоқыс жинау акцияларын ұйымдастыру.", ru: "Поиск стихийных свалок и организация уборок." },
    members: 142,
    city: { kk: "Облыс бойынша", ru: "По всей области" },
    works: [
      { kk: "Ай сайын полигон рейдтері", ru: "Ежемесячные рейды по полигонам" },
      { kk: "Қоқысты бөліп жинау семинарлары", ru: "Семинары по раздельному сбору" },
      { kk: "TazaEl картасына нүкте қосу", ru: "Добавление точек на карту TazaEl" },
    ],
    participants: ["И", "Т", "С", "Г", "А", "В", "К"],
  },
];

const PROJECTS: Project[] = [
  {
    id: "p1",
    cover: "https://images.unsplash.com/photo-1503785640985-f62e3aeee448?w=800&q=70",
    title: { kk: "Ақтау жағалауын тазалау", ru: "Уборка побережья Актау" },
    date: "2026-05-18",
    place: { kk: "Ақтау, 14-ші мкр жағалауы", ru: "Актау, побережье 14 мкр" },
    result: { kk: "1.4 тонна қоқыс жиналды", ru: "Собрано 1.4 тонны мусора" },
    photos: [
      "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?w=600&q=70",
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=70",
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=70",
    ],
    done: [
      { kk: "70+ волонтер қатысты", ru: "Участвовало 70+ волонтёров" },
      { kk: "3 шақырым жағалау тазартылды", ru: "Очищено 3 км побережья" },
      { kk: "Пластик пен шыны бөлек тапсырылды", ru: "Пластик и стекло сданы раздельно" },
    ],
  },
  {
    id: "p2",
    cover: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=70",
    title: { kk: "1000 ағаш — Жаңаөзен", ru: "1000 деревьев — Жанаозен" },
    date: "2026-04-04",
    place: { kk: "Жаңаөзен, орталық саябақ", ru: "Жанаозен, центральный парк" },
    result: { kk: "1 240 тал ағаш отырғызылды", ru: "Высажено 1 240 деревьев" },
    photos: [
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=70",
      "https://images.unsplash.com/photo-1444392061186-9fc38f84f726?w=600&q=70",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=70",
    ],
    done: [
      { kk: "Сексеуіл және жыңғыл түрлері", ru: "Виды: саксаул и тамариск" },
      { kk: "Тамшылатып суару жүйесі орнатылды", ru: "Установлена система капельного полива" },
      { kk: "6 ай бойы күтім кестесі бекітілді", ru: "Утверждён 6-месячный график ухода" },
    ],
  },
  {
    id: "p3",
    cover: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=70",
    title: { kk: "Қарақия — қоқыс рейді", ru: "Каракия — рейд против свалок" },
    date: "2026-03-22",
    place: { kk: "Қарақия ауданы", ru: "Каракиянский район" },
    result: { kk: "8 заңсыз полигон тіркелді", ru: "Зафиксировано 8 стихийных свалок" },
    photos: [
      "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&q=70",
      "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=70",
    ],
    done: [
      { kk: "Барлық нүктелер TazaEl картасында", ru: "Все точки на карте TazaEl" },
      { kk: "Әкімдікке ресми ұсыныс жіберілді", ru: "Направлено обращение в акимат" },
    ],
  },
];

const INITIAL_FUNDS: Fund[] = [
  {
    id: "f1",
    emoji: "🌳",
    title: { kk: "5000 сексеуіл — Маңғыстау даласы", ru: "5000 саксаулов — степь Мангистау" },
    goal_text: { kk: "Шөлейттенуге қарсы 5000 тал сексеуіл отырғызу.", ru: "Высадить 5000 саксаулов против опустынивания." },
    target: 3500000,
    raised: 1820000,
  },
  {
    id: "f2",
    emoji: "🌊",
    title: { kk: "Каспий жағалауын тазалау құрал-жабдықтары", ru: "Снаряжение для уборки Каспия" },
    goal_text: { kk: "Қолғап, қаптар, контейнерлер және қорғаныс жабдықтары.", ru: "Перчатки, мешки, контейнеры и СИЗ." },
    target: 1200000,
    raised: 940000,
  },
  {
    id: "f3",
    emoji: "💧",
    title: { kk: "Мектептерге тамшылатып суару", ru: "Капельный полив для школ" },
    goal_text: { kk: "10 мектеп ауласына көгалдандыру және су үнемдеу жүйесі.", ru: "Озеленение и система экономии воды для 10 школ." },
    target: 5000000,
    raised: 2150000,
  },
  {
    id: "f4",
    emoji: "🦭",
    title: { kk: "Каспий итбалықтарын қорғау", ru: "Защита каспийских тюленей" },
    goal_text: { kk: "Мониторинг, ветеринария және ағарту бағдарламасы.", ru: "Мониторинг, ветпомощь и просвещение." },
    target: 2000000,
    raised: 480000,
  },
];

const fmtKZT = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₸";

function VolunteersPage() {
  const { lang } = useLanguage();
  const L = lang === "kk";
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [openGroup, setOpenGroup] = useState<Group | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUNDS);
  const [donateFund, setDonateFund] = useState<Fund | null>(null);
  const [donateAmount, setDonateAmount] = useState<string>("2000");

  const join = (g: Group) => {
    setJoined((s) => ({ ...s, [g.id]: true }));
    toast.success(L ? `«${g.name.kk}» тобына қосылдыңыз!` : `Вы вступили в «${g.name.ru}»!`);
  };

  const donate = () => {
    if (!donateFund) return;
    const amt = Math.max(0, parseInt(donateAmount.replace(/\D/g, ""), 10) || 0);
    if (!amt) return;
    setFunds((arr) => arr.map((f) => (f.id === donateFund.id ? { ...f, raised: Math.min(f.target, f.raised + amt) } : f)));
    toast.success(L ? `Рахмет! ${fmtKZT(amt)} қайырымдылық жасалды.` : `Спасибо! Пожертвовано ${fmtKZT(amt)}.`);
    setDonateFund(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <MangystauNav />

      {/* Hero */}
      <section className="px-6 py-12 md:py-16 max-w-7xl mx-auto">
        <span className="inline-flex items-center gap-2 bg-accent text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
          <HandHeart className="size-3.5" /> {L ? "Волонтерлік" : "Волонтёрство"}
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5 max-w-3xl">
          {L ? (<>Маңғыстауды бірге <span className="text-primary">тазалайық</span>.</>) : (<>Сделаем Мангистау <span className="text-primary">чище вместе</span>.</>)}
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          {L
            ? "Топтарға қосылыңыз, эко-жобаларға қатысыңыз және Маңғыстау табиғатын қорғауға бағытталған бастамаларды қаржылай қолдаңыз."
            : "Вступайте в группы, участвуйте в эко-проектах и поддерживайте инициативы по защите природы Мангистау."}
        </p>
      </section>

      {/* Groups */}
      <section className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{L ? "Топтар" : "Группы"}</p>
            <h2 className="font-display text-2xl md:text-4xl font-bold">{L ? "Волонтерлік топтар" : "Волонтёрские группы"}</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-foreground/60">
            <Users className="size-4" /> {GROUPS.reduce((a, g) => a + g.members, 0)}+ {L ? "белсенді мүше" : "активных участников"}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.id} className="bg-background p-6 rounded-3xl border border-foreground/10 hover:border-primary/40 hover:shadow-xl transition-all flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 bg-primary/10 rounded-2xl grid place-items-center">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <span className="text-[11px] font-bold bg-secondary px-2.5 py-1 rounded-full text-foreground/70">{g.city[lang]}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{g.name[lang]}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed mb-4 flex-1">{g.goal[lang]}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {g.participants.slice(0, 5).map((p, i) => (
                      <div key={i} className="size-7 rounded-full bg-primary/15 border-2 border-background grid place-items-center text-[11px] font-bold text-primary">{p}</div>
                    ))}
                    <div className="size-7 rounded-full bg-foreground text-background border-2 border-background grid place-items-center text-[10px] font-bold">+{g.members - 5}</div>
                  </div>
                  <span className="text-xs text-foreground/50">{g.members} {L ? "мүше" : "чел."}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setOpenGroup(g)} className="flex-1 border border-foreground/10 rounded-xl py-2.5 text-sm font-semibold hover:bg-secondary transition-colors">
                    {L ? "Толығырақ" : "Подробнее"}
                  </button>
                  <button
                    onClick={() => join(g)}
                    disabled={joined[g.id]}
                    className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:bg-foreground/10 disabled:text-foreground/50"
                  >
                    {joined[g.id] ? (L ? "Қосылдыңыз ✓" : "Вы в группе ✓") : (L ? "Қосылу" : "Вступить")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 px-6 bg-secondary/40 border-y border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{L ? "Жобалар мен іс-шаралар" : "Проекты и события"}</p>
            <h2 className="font-display text-2xl md:text-4xl font-bold">{L ? "Атқарылған жұмыстар" : "Реализованные инициативы"}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROJECTS.map((p) => (
              <button key={p.id} onClick={() => setOpenProject(p)} className="text-left bg-background rounded-3xl overflow-hidden border border-foreground/5 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={p.cover} alt={p.title[lang]} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-[11px] text-foreground/50 mb-2">
                    <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{p.date}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{p.place[lang]}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-1.5">{p.title[lang]}</h3>
                  <p className="text-sm text-primary font-semibold">{p.result[lang]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Donations */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{L ? "Қайырымдылық" : "Пожертвования"}</p>
            <h2 className="font-display text-2xl md:text-4xl font-bold">{L ? "Эко-жобаларды қаржылай қолдау" : "Поддержать эко-проекты"}</h2>
          </div>
          <p className="text-sm text-foreground/60 max-w-md">
            {L ? "Әр жарна — Маңғыстау экологиясын жақсартуға қосылған нақты үлес." : "Каждый взнос — реальный вклад в улучшение экологии Мангистау."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {funds.map((f) => {
            const pct = Math.min(100, Math.round((f.raised / f.target) * 100));
            return (
              <div key={f.id} className="bg-background border border-foreground/10 rounded-3xl p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="size-14 rounded-2xl bg-primary/10 grid place-items-center text-3xl">{f.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold leading-tight mb-1">{f.title[lang]}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{f.goal_text[lang]}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="font-bold text-foreground">{fmtKZT(f.raised)}</span>
                    <span className="text-foreground/50">{L ? "мақсат" : "цель"}: {fmtKZT(f.target)}</span>
                  </div>
                  <p className="text-[11px] text-primary font-bold mt-1">{pct}% {L ? "жиналды" : "собрано"}</p>
                </div>

                <button
                  onClick={() => { setDonateFund(f); setDonateAmount("2000"); }}
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-2xl py-3 font-bold hover:bg-primary transition-colors"
                >
                  <HandHeart className="size-4" /> {L ? "Қолдау көрсету" : "Поддержать"} <ArrowRight className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Group modal */}
      {openGroup && (
        <Modal onClose={() => setOpenGroup(null)}>
          <div className="flex items-start gap-4 mb-5">
            <div className="size-14 rounded-2xl bg-primary/10 grid place-items-center">
              <openGroup.icon className="size-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold">{openGroup.name[lang]}</h3>
              <p className="text-sm text-foreground/60">{openGroup.city[lang]} · {openGroup.members} {L ? "мүше" : "участников"}</p>
            </div>
          </div>
          <p className="text-foreground/70 leading-relaxed mb-5">{openGroup.goal[lang]}</p>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{L ? "Қатысушылар" : "Участники"}</p>
            <div className="flex flex-wrap gap-2">
              {openGroup.participants.map((p, i) => (
                <div key={i} className="size-9 rounded-full bg-primary/10 grid place-items-center text-sm font-bold text-primary">{p}</div>
              ))}
              <div className="size-9 rounded-full bg-foreground text-background grid place-items-center text-xs font-bold">+{openGroup.members - openGroup.participants.length}</div>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{L ? "Атқарып жатқан жұмыстар" : "Текущие работы"}</p>
            <ul className="space-y-2">
              {openGroup.works.map((w, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                  <span>{w[lang]}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => { join(openGroup); setOpenGroup(null); }}
            disabled={joined[openGroup.id]}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-bold hover:opacity-90 disabled:bg-foreground/10 disabled:text-foreground/50"
          >
            {joined[openGroup.id] ? (L ? "Сіз бұл топтасыз ✓" : "Вы уже в группе ✓") : (L ? "Топқа қосылу" : "Вступить в группу")}
          </button>
        </Modal>
      )}

      {/* Project modal */}
      {openProject && (
        <Modal onClose={() => setOpenProject(null)}>
          <div className="aspect-[16/9] -mx-6 -mt-6 mb-5 overflow-hidden bg-secondary">
            <img src={openProject.cover} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground/50 mb-2">
            <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" />{openProject.date}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{openProject.place[lang]}</span>
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">{openProject.title[lang]}</h3>
          <p className="text-primary font-semibold mb-5">{openProject.result[lang]}</p>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{L ? "Атқарылған жұмыстар" : "Что сделано"}</p>
            <ul className="space-y-2">
              {openProject.done.map((d, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                  <span>{d[lang]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{L ? "Фотосуреттер" : "Фотографии"}</p>
            <div className="grid grid-cols-3 gap-2">
              {openProject.photos.map((src, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-secondary">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Donate modal */}
      {donateFund && (
        <Modal onClose={() => setDonateFund(null)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center text-2xl">{donateFund.emoji}</div>
            <div>
              <p className="text-xs text-foreground/50 uppercase tracking-wider font-bold">{L ? "Қайырымдылық" : "Пожертвование"}</p>
              <h3 className="font-display text-lg font-bold leading-tight">{donateFund.title[lang]}</h3>
            </div>
          </div>
          <label className="block text-sm font-semibold mb-2">{L ? "Сома (₸)" : "Сумма (₸)"}</label>
          <input
            type="text"
            inputMode="numeric"
            value={donateAmount}
            onChange={(e) => setDonateAmount(e.target.value)}
            className="w-full border-2 border-foreground/10 rounded-2xl px-4 py-3 text-lg font-bold focus:border-primary outline-none mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-5">
            {[1000, 2000, 5000, 10000].map((v) => (
              <button key={v} onClick={() => setDonateAmount(String(v))} className="px-3 py-1.5 text-sm rounded-full bg-secondary hover:bg-primary/10 font-semibold">
                {fmtKZT(v)}
              </button>
            ))}
          </div>
          <button onClick={donate} className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-bold hover:opacity-90 inline-flex items-center justify-center gap-2">
            <HandHeart className="size-4" /> {L ? "Қолдау" : "Поддержать"}
          </button>
          <p className="text-[11px] text-foreground/40 text-center mt-3">
            {L ? "Демо режим: нақты төлем өңделмейді." : "Демо-режим: реальная оплата не выполняется."}
          </p>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-background rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 size-9 rounded-full bg-secondary hover:bg-foreground/10 grid place-items-center z-10">
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}