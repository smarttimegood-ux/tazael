import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MangystauNav() {
  const { lang, setLang } = useLanguage();
  const L = lang === "kk";
  const [open, setOpen] = useState(false);
  const linkCls = "px-3 py-1.5 rounded-full hover:bg-secondary transition-colors";
  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-foreground/5 px-4 md:px-6 py-3">
      <div className="flex justify-between items-center gap-3">
      <div className="flex items-center gap-6 md:gap-10 min-w-0">
        <Link to="/" className="flex items-center gap-2 min-w-0" onClick={() => setOpen(false)}>
          <div className="size-8 rounded-xl bg-primary grid place-items-center text-primary-foreground font-extrabold font-display text-sm">T</div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="font-display text-base font-extrabold tracking-tight text-foreground">TazaEl</span>
            <span className="text-[10px] text-foreground/50 font-medium uppercase tracking-wider">Маңғыстау</span>
          </div>
        </Link>
        <div className="hidden md:flex gap-1 text-sm font-medium">
          <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Басты" : "Главная"}</Link>
          <Link to="/map" className={linkCls} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Эко-карта" : "Эко-карта"}</Link>
          <Link to="/report" className={linkCls} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Репорт жіберу" : "Сообщить"}</Link>
          <Link to="/dashboard" className={linkCls} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Әкімдік дашборды" : "Дашборд"}</Link>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setLang(lang === "kk" ? "ru" : "kk")}
          className="text-xs font-bold bg-secondary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
        >
          {lang === "kk" ? "KZ" : "RU"}
        </button>
        <Link to="/report" className="hidden sm:inline-flex bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary transition-all">
          {L ? "Репорт +" : "Сообщить +"}
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="md:hidden grid place-items-center size-9 rounded-full bg-secondary hover:bg-primary/10 transition-colors"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      </div>
      {open && (
        <div className="md:hidden mt-3 pt-3 border-t border-foreground/5 flex flex-col gap-1 text-sm font-medium">
          <Link to="/" onClick={() => setOpen(false)} className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Басты" : "Главная"}</Link>
          <Link to="/map" onClick={() => setOpen(false)} className={linkCls} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Эко-карта" : "Эко-карта"}</Link>
          <Link to="/report" onClick={() => setOpen(false)} className={linkCls} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Репорт жіберу" : "Сообщить"}</Link>
          <Link to="/dashboard" onClick={() => setOpen(false)} className={linkCls} activeProps={{ className: "bg-secondary text-primary" }}>{L ? "Әкімдік дашборды" : "Дашборд"}</Link>
        </div>
      )}
    </nav>
  );
}