-- event_spaces_cards 테이블 생성
CREATE TABLE IF NOT EXISTS public.event_spaces_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 정책 설정
ALTER TABLE public.event_spaces_cards ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "Enable read access for all users" ON public.event_spaces_cards
    FOR SELECT USING (true);

-- 관리자만 수정 가능 (필요에 따라 인증 정책 추가, 현재는 데모용 public 허용)
CREATE POLICY "Enable insert for all users" ON public.event_spaces_cards
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.event_spaces_cards
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.event_spaces_cards
    FOR DELETE USING (true);
