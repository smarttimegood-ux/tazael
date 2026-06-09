import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "kk" | "ru";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  kk: {
    nav_education: "Білім беру",
    nav_marketplace: "Маркетплейс",
    nav_map: "Карта",
    nav_community: "Қауымдастық",
    login: "Кіру",
    hero_badge: "Цифрлық Эко-Жүйе",
    hero_title: "Таза табиғат — сенен басталады",
    hero_desc: "Қазақстандағы экологиялық мәдениетті бірге қалыптастырайық. Қалдықтарды тапсырыңыз, заттарды бөлісіңіз және табиғатты сақтаңыз.",
    cta_join: "Қосылу",
    cta_more: "Толығырақ",
    air_quality: "Ауа сапасы: Жақсы",
    air_quality_city: "Алматы қаласы бойынша бүгінгі көрсеткіш",
    marketplace_title: "Қайта қолдану маркетплейсі",
    marketplace_desc: "Заттарға екінші өмір сыйлаңыз",
    marketplace_view_all: "Барлығын көру",
    item_chair: "Ағаш орындық",
    item_books: "Кітаптар жинағы",
    item_camera: "Фотоаппарат",
    item_plant: "Үй өсімдігі",
    price_free: "Тегін",
    price_gift: "Сыйлыққа",
    price_500: "500 ₸",
    location_almaty: "Алматы, Медеу ауданы",
    location_astana: "Астана, Есіл ауданы",
    location_shymkent: "Шымкент, Орталық",
    location_aktau: "Ақтау, 7-ші мкр",
    btn_take: "Алу",
    map_title: "Өңдеу орталықтары",
    map_desc: "Сізге ең жақын қабылдау пунктін табыңыз. Геолокация арқылы бағытты анықтаңыз.",
    center_ecoalmaty: "EcoAlmaty Center",
    center_techno: "TechnoRecycle",
    accepts_plastic_paper_glass: "Пластик, Қағаз, Шыны",
    accepts_electronics_metal: "Электроника, Металл",
    distance_450m: "450 метр қашықтықта",
    distance_1_2km: "1.2 км қашықтықта",
    map_open: "Картаны ашу",
    ai_tip_label: "Эко-Кеңес",
    ai_tip_text: "Пластик бөтелкенің қақпағын бөлек тапсыру арқылы өңдеу тиімділігін 15%-ға арттыра аласыз.",
    education_title: "Экобілім беру",
    education_desc: "Ауа, су және топырақ ластануының зардаптары туралы қарапайым материалдар.",
    news_title: "Экологиялық жаңалықтар",
    news_desc: "Қазақстандағы және әлемдегі экологияға қатысты соңғы жаңалықтар.",
    community_title: "Экоқауымдастық",
    community_desc: "Белсенділік көрсетіңіз, волонтерлікке қатысыңыз, өз тәжірибеңізбен бөлісіңіз.",
    rewards_title: "Марапаттау жүйесі",
    rewards_desc: "Экологиялық әрекеттер үшін ұпай жинап, бейдждер мен марапаттар алыңыз.",
    features_title: "Платформа мүмкіндіктері",
    features_desc: "Таза болашаққа жетелейтін 6 негізгі бағыт",
    footer_tagline: "Қазақстандағы экологиялық мәдениетті қалыптастыратын бірыңғай цифрлық экожүйе.",
    footer_platform: "Платформа",
    footer_contact: "Байланыс",
    footer_copyright: "© 2025 TazaEl Project. Бірге таза Қазақстан.",
    link_education: "Білім",
    link_news: "Жаңалықтар",
    link_marketplace: "Маркетплейс",
    link_instagram: "Instagram",
    link_telegram: "Telegram",
    link_email: "Email",
    lang_kk: "Қазақша",
    lang_ru: "Русский",
    xp: "1,240 XP",
  },
  ru: {
    nav_education: "Образование",
    nav_marketplace: "Маркетплейс",
    nav_map: "Карта",
    nav_community: "Сообщество",
    login: "Войти",
    hero_badge: "Цифровая Эко-Система",
    hero_title: "Чистая природа — начинается с тебя",
    hero_desc: "Вместе формируем экологическую культуру в Казахстане. Сдавайте отходы, делитесь вещами и сохраняйте природу.",
    cta_join: "Присоединиться",
    cta_more: "Подробнее",
    air_quality: "Качество воздуха: Хорошее",
    air_quality_city: "Показатель сегодня по городу Алматы",
    marketplace_title: "Маркетплейс повторного использования",
    marketplace_desc: "Дайте вещам вторую жизнь",
    marketplace_view_all: "Смотреть все",
    item_chair: "Деревянный стул",
    item_books: "Набор книг",
    item_camera: "Фотоаппарат",
    item_plant: "Комнатное растение",
    price_free: "Бесплатно",
    price_gift: "В дар",
    price_500: "500 ₸",
    location_almaty: "Алматы, район Медеу",
    location_astana: "Астана, район Есиль",
    location_shymkent: "Шымкент, Центр",
    location_aktau: "Актау, 7-й мкр",
    btn_take: "Забрать",
    map_title: "Центры переработки",
    map_desc: "Найдите ближайший пункт приема. Определите маршрут через геолокацию.",
    center_ecoalmaty: "EcoAlmaty Center",
    center_techno: "TechnoRecycle",
    accepts_plastic_paper_glass: "Пластик, Бумага, Стекло",
    accepts_electronics_metal: "Электроника, Металл",
    distance_450m: "450 метров от вас",
    distance_1_2km: "1.2 км от вас",
    map_open: "Открыть карту",
    ai_tip_label: "Эко-Совет",
    ai_tip_text: "Сдавая крышки пластиковых бутылок отдельно, можно повысить эффективность переработки на 15%.",
    education_title: "Экообразование",
    education_desc: "Простые материалы о последствиях загрязнения воздуха, воды и почвы.",
    news_title: "Экологические новости",
    news_desc: "Последние новости об экологии в Казахстане и мире.",
    community_title: "Экосообщество",
    community_desc: "Будьте активными, участвуйте в волонтерстве, делитесь опытом.",
    rewards_title: "Система наград",
    rewards_desc: "Зарабатывайте баллы за экологические действия и получайте значки.",
    features_title: "Возможности платформы",
    features_desc: "6 ключевых направлений к чистому будущему",
    footer_tagline: "Единая цифровая экосистема, формирующая экологическую культуру в Казахстане.",
    footer_platform: "Платформа",
    footer_contact: "Контакты",
    footer_copyright: "© 2025 TazaEl Project. Чистый Казахстан вместе.",
    link_education: "Образование",
    link_news: "Новости",
    link_marketplace: "Маркетплейс",
    link_instagram: "Instagram",
    link_telegram: "Telegram",
    link_email: "Email",
    lang_kk: "Қазақша",
    lang_ru: "Русский",
    xp: "1,240 XP",
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("kk");

  const t = (key: string): string => {
    return translations[lang][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
