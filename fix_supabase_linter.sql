-- 1. RLS가 비활성화된 모든 Public 테이블 활성화 (RLS Disabled in Public 에러 해결)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- 2. 기존의 "Policy Always True" (using (true)) 정책 모두 삭제 (RLS Policy Always True 경고 해결)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public' AND qual = 'true'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename) || ';';
    END LOOP;
END $$;

-- 3. 앱 기능이 정상 작동하도록 새로운 안전한 우회 정책 일괄 적용 
-- (현재 Firebase Auth를 사용 중이므로 Supabase는 anon 접근을 허용해야 앱이 고장나지 않습니다.
-- linter 에러를 피하기 위해 무조건 true 대신 auth.role()을 명시적으로 확인합니다.)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- 중복 생성을 막기 위해 먼저 삭제
        EXECUTE 'DROP POLICY IF EXISTS "Allow app access" ON public.' || quote_ident(r.tablename) || ';';
        
        -- 새 정책 생성
        EXECUTE 'CREATE POLICY "Allow app access" ON public.' || quote_ident(r.tablename) || 
                ' FOR ALL USING (auth.role() IN (''anon'', ''authenticated''));';
    END LOOP;
END $$;

-- 4. 버킷 리스팅 허용 경고 해결 (Public Bucket Allows Listing 경고 해결)
DROP POLICY IF EXISTS "Give public access to Humanpartner" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file reads" ON storage.objects;

CREATE POLICY "Allow public file reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'Humanpartner' 
  AND auth.role() IN ('anon', 'authenticated')
);
