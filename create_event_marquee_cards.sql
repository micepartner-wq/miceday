-- 메인 페이지 무한 롤링 이벤트 카드 테이블 생성
CREATE TABLE IF NOT EXISTS public.event_marquee_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 정책 설정
ALTER TABLE public.event_marquee_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.event_marquee_cards
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.event_marquee_cards
    FOR ALL USING (auth.role() = 'authenticated');
