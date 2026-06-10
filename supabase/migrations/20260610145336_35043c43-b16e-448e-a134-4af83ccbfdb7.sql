
CREATE TYPE public.eco_category AS ENUM ('illegal_dump','oil_spill','water_shortage','air_pollution','radioactive','sea_pollution','dead_wildlife','other');
CREATE TYPE public.eco_status AS ENUM ('new','in_review','in_progress','resolved','rejected');
CREATE TYPE public.eco_severity AS ENUM ('low','medium','high','critical');

CREATE TABLE public.eco_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.eco_category NOT NULL DEFAULT 'other',
  severity public.eco_severity NOT NULL DEFAULT 'medium',
  status public.eco_status NOT NULL DEFAULT 'new',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  reporter_name TEXT,
  reporter_contact TEXT,
  ai_summary TEXT,
  ai_recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.eco_reports TO anon, authenticated;
GRANT ALL ON public.eco_reports TO service_role;
ALTER TABLE public.eco_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports" ON public.eco_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can submit reports" ON public.eco_reports FOR INSERT WITH CHECK (true);

CREATE INDEX idx_eco_reports_created ON public.eco_reports(created_at DESC);
CREATE INDEX idx_eco_reports_status ON public.eco_reports(status);

-- Seed Mangystau reports
INSERT INTO public.eco_reports (category, severity, status, title, description, location_name, lat, lng, reporter_name) VALUES
('illegal_dump','high','in_review','Ақтау маңындағы заңсыз полигон','Қала шетінде үлкен қоқыс үйіндісі пайда болды, желмен дала ішіне қоқыс ұшырылып жатыр.','Ақтау, 32 шағынаудан шеті', 43.6450, 51.1980, 'Аян Б.'),
('oil_spill','critical','new','Мұнай төгілуі — Каспий жағалауы','Жағалаудан 200м қашықтықта мұнай дағы байқалды, балықтар өліп жатыр.','Каспий жағалауы, Ақтау оңтүстігі', 43.5800, 51.1500, 'Айгүл К.'),
('radioactive','critical','in_progress','Қошқар-Ата уыты қоймасы','Ескі қойма құрылғыларынан ағу белгілері — топырақ түсі өзгерген.','Қошқар-Ата, Ақтаудан 3 км', 43.6920, 51.2210, 'Эко-патруль'),
('water_shortage','high','new','Жаңаөзенде су тапшылығы','3-ші ауданда 5 күн бойы су жоқ.','Жаңаөзен, 3-ші ы/а', 43.3416, 52.8576, 'Мақсат Ж.'),
('sea_pollution','medium','resolved','Жағажайдағы пластик','Жағажай тазаланды, 80 қап жиналды.','Ақтау, қалалық жағажай', 43.6470, 51.1750, 'Волонтер тобы'),
('dead_wildlife','high','in_review','Каспий итбалықтары','Жағалаудан 4 өлген итбалық табылды.','Форт-Шевченко жанындағы жағалау', 44.5089, 50.2640, 'Балықшы'),
('air_pollution','medium','new','Шаңды дауыл','Полигоннан ұшқан шаң тұрғын үй ауданына жетті.','Ақтау, 14 ы/а', 43.6520, 51.1620, NULL),
('illegal_dump','medium','new','Көше шетіндегі қоқыс','Құрылыс қалдықтары далаға тасталған.','Мұнайлы ауданы', 43.7820, 51.2440, 'Анонимді');
