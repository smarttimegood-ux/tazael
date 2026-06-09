import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/context/LanguageContext";
import heroImg from "@/assets/hero.jpg";
import chairImg from "@/assets/market-chair.jpg";
import booksImg from "@/assets/market-books.jpg";
import cameraImg from "@/assets/market-camera.jpg";
import plantImg from "@/assets/market-plant.jpg";
import { BookOpen, Newspaper, Users, Award, MapPin, Recycle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TazaEl — Экологиялық цифрлық платформа" },
      { name: "description", content: "Қазақстандағы экологиялық мәдениетті қалыптастыратын бірыңғай цифрлық экожүйе." },
      { property: "og:title", content: "TazaEl — Экологиялық цифрлық платформа" },
      { property: "og:description", content: "Қазақстандағы экологиялық мәдениетті қалыптастыратын бірыңғай цифрлық экожүйе." },
    ],
  }),
  component: Index,
});

function Index() {
  const { lang, setLang, t } = useLanguage();

  const features = [
    { icon: BookOpen, title: t("education_title"), desc: t("education_desc") },
    { icon: Newspaper, title: t("news_title"), desc: t("news_desc") },
    { icon: Recycle, title: t("marketplace_title"), desc: t("marketplace_desc") },
    { icon: MapPin, title: t("map_title"), desc: t("map_desc") },
    { icon: Users, title: t("community_title"), desc: t("community_desc") },
    { icon: Award, title: t("rewards_title"), desc: t("rewards_desc") },
  ];

  const items = [
    { img: chairImg, title: t("item_chair"), price: t("price_free"), loc: t("location_almaty") },
    { img: booksImg, title: t("item_books"), price: t("price_500"), loc: t("location_astana") },
    { img: cameraImg, title: t("item_camera"), price: t("price_gift"), loc: t("location_shymkent") },
    { img: plantImg, title: t("item_plant"), price: t("price_free"), loc: t("location_aktau") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <span className="font-display text-2xl font-extrabold tracking-tighter text-primary">TazaEl</span>
          <div className="hidden md:flex gap-6 text-sm font-medium text-foreground/60">
            <a href="#features" className="hover:text-primary transition-colors">{t("nav_education")}</a>
            <a href="#marketplace" className="hover:text-primary transition-colors">{t("nav_marketplace")}</a>
            <a href="#map" className="hover:text-primary transition-colors">{t("nav_map")}</a>
            <a href="#features" className="hover:text-primary transition-colors">{t("nav_community")}</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "kk" ? "ru" : "kk")}
            className="text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
          >
            {lang === "kk" ? t("lang_kk") : t("lang_ru")}
          </button>
          <div className="bg-accent/20 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="size-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-bold text-primary">{t("xp")}</span>
          </div>
          <button className="bg-foreground text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary transition-all">
            {t("login")}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-accent text-primary px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            {t("hero_badge")}
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            {lang === "kk" ? (
              <>Таза табиғат — <span className="text-primary underline decoration-accent underline-offset-8">сенен</span> басталады</>
            ) : (
              <>Чистая природа — <span className="text-primary underline decoration-accent underline-offset-8">с тебя</span></>
            )}
          </h1>
          <p className="text-lg text-foreground/70 mb-10 leading-relaxed max-w-md">
            {t("hero_desc")}
          </p>
          <div className="flex gap-4">
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              {t("cta_join")}
            </button>
            <button className="border-2 border-foreground/10 px-8 py-4 rounded-2xl font-bold hover:bg-foreground/5 transition-all">
              {t("cta_more")}
            </button>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="Kazakh steppe with solar panels"
            width={1024}
            height={1024}
            className="w-full aspect-square object-cover rounded-[40px] outline outline-1 -outline-offset-1 outline-black/5"
          />
          <div className="absolute -bottom-6 -left-6 bg-background p-6 rounded-3xl shadow-2xl border border-foreground/5 max-w-[240px]">
            <div className="flex gap-2 mb-2">
              <div className="size-3 bg-accent rounded-full" />
              <div className="size-3 bg-accent/40 rounded-full" />
              <div className="size-3 bg-accent/20 rounded-full" />
            </div>
            <p className="text-sm font-bold">{t("air_quality")}</p>
            <p className="text-xs text-foreground/50">{t("air_quality_city")}</p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t("features_title")}</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">{t("features_desc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-background p-8 rounded-3xl border border-foreground/5 hover:border-primary/20 hover:shadow-lg transition-all group">
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Snippet */}
      <section id="marketplace" className="bg-foreground text-primary-foreground py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold mb-4">{t("marketplace_title")}</h2>
              <p className="text-primary-foreground/60">{t("marketplace_desc")}</p>
            </div>
            <button className="text-accent font-bold border-b border-accent pb-1 hover:text-primary-foreground hover:border-primary-foreground transition-colors">
              {t("marketplace_view_all")}
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.title} className="group bg-primary-foreground/5 border border-primary-foreground/10 rounded-3xl p-4 hover:bg-primary-foreground/10 transition-all">
                <img
                  src={item.img}
                  alt={item.title}
                  width={512}
                  height={512}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-2xl mb-4 bg-primary-foreground/5"
                />
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold">{item.title}</h3>
                  <span className="text-accent font-bold">{item.price}</span>
                </div>
                <p className="text-xs text-primary-foreground/40 mb-4">{item.loc}</p>
                <button className="w-full py-3 bg-primary-foreground text-foreground rounded-xl font-bold text-sm opacity-0 group-hover:opacity-100 transition-all">
                  {t("btn_take")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recycling Map Section */}
      <section id="map" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h2 className="font-display text-4xl font-bold mb-6">{t("map_title")}</h2>
            <p className="text-foreground/60 mb-8">{t("map_desc")}</p>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5">
                <p className="font-bold text-primary">{t("center_ecoalmaty")}</p>
                <p className="text-xs text-foreground/60">{t("accepts_plastic_paper_glass")}</p>
                <p className="text-xs mt-2">{t("distance_450m")}</p>
              </div>
              <div className="p-4 rounded-2xl border border-foreground/5 hover:bg-foreground/5 transition-colors cursor-pointer">
                <p className="font-bold">{t("center_techno")}</p>
                <p className="text-xs text-foreground/60">{t("accepts_electronics_metal")}</p>
                <p className="text-xs mt-2">{t("distance_1_2km")}</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 relative">
            <div className="w-full h-[500px] bg-secondary/50 rounded-[32px] border border-foreground/5 shadow-inner overflow-hidden relative">
              {/* Stylized map visualization */}
              <svg className="w-full h-full" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="500" fill="#f8fafc" />
                {/* City grid */}
                <g stroke="#e2e8f0" strokeWidth="1">
                  {Array.from({ length: 11 }, (_, i) => (
                    <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="500" />
                  ))}
                  {Array.from({ length: 7 }, (_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 80 + 20} x2="800" y2={i * 80 + 20} />
                  ))}
                </g>
                {/* Park areas */}
                <ellipse cx="200" cy="150" rx="80" ry="60" fill="#dcfce7" opacity="0.6" />
                <ellipse cx="600" cy="350" rx="100" ry="70" fill="#dcfce7" opacity="0.6" />
                {/* Water */}
                <path d="M0 400 Q200 350 400 400 T800 380 V500 H0 Z" fill="#e0f2fe" opacity="0.5" />
                {/* Recycling points */}
                <circle cx="320" cy="220" r="12" fill="#065f46" opacity="0.9" />
                <circle cx="320" cy="220" r="6" fill="#bef264" />
                <circle cx="480" cy="180" r="10" fill="#065f46" opacity="0.7" />
                <circle cx="480" cy="180" r="4" fill="#bef264" />
                <circle cx="180" cy="320" r="10" fill="#065f46" opacity="0.7" />
                <circle cx="180" cy="320" r="4" fill="#bef264" />
                <circle cx="650" cy="280" r="10" fill="#065f46" opacity="0.7" />
                <circle cx="650" cy="280" r="4" fill="#bef264" />
                {/* User location */}
                <circle cx="400" cy="250" r="16" fill="#065f46" opacity="0.2">
                  <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="400" cy="250" r="8" fill="#065f46" />
                <circle cx="400" cy="250" r="3" fill="#bef264" />
              </svg>
              {/* Map labels */}
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-xl text-xs font-semibold shadow-sm border border-foreground/5">
                Алматы, Қазақстан
              </div>
            </div>
            <button className="absolute bottom-8 right-8 bg-foreground text-primary-foreground p-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold">
              {t("map_open")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/5 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <span className="font-display text-2xl font-bold text-primary block mb-4">TazaEl</span>
              <p className="text-sm text-foreground/60 max-w-[320px]">{t("footer_tagline")}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">{t("footer_platform")}</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#features" className="hover:text-primary transition-colors">{t("link_education")}</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">{t("link_news")}</a></li>
                <li><a href="#marketplace" className="hover:text-primary transition-colors">{t("link_marketplace")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">{t("footer_contact")}</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">{t("link_instagram")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("link_telegram")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("link_email")}</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between pt-8 border-t border-foreground/5 gap-4">
            <p className="text-xs text-foreground/40">{t("footer_copyright")}</p>
            <div className="flex gap-4">
              <span className="text-[10px] font-mono py-1 px-2 border border-foreground/10 rounded">v0.1.0-demo</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Tip Floating Banner */}
      <div className="fixed bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-96 bg-accent p-5 rounded-3xl shadow-2xl border border-primary/20 flex gap-4 items-start z-40">
        <div className="size-10 shrink-0 bg-primary rounded-2xl grid place-items-center text-primary-foreground font-bold text-sm">AI</div>
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t("ai_tip_label")}</p>
          <p className="text-sm font-medium text-primary leading-snug">{t("ai_tip_text")}</p>
        </div>
      </div>
    </div>
  );
}
