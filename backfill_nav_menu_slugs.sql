-- Backfill slug values for all nav_menu_items.
-- Safe to run multiple times (only updates rows with NULL/empty slug).
-- Run AFTER: add_nav_menu_slug.sql

-- ══════════════════════════════════════
-- 1) Parent groups (category IS NULL)
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = CASE name
    WHEN '기업 세미나' THEN 'corporate-seminar'
    WHEN '채용/교육' THEN 'recruitment-training'
    WHEN '전시/박람회' THEN 'exhibition-expo'
    WHEN 'IT/해커톤' THEN 'it-hackathon'
    WHEN '사무실' THEN 'office'
    WHEN '오피스' THEN 'office'
    WHEN '학회/컨퍼런스' THEN 'academic-conference'
    WHEN '관공서/행정' THEN 'public-administration'
    WHEN '공연/축제' THEN 'performance-festival'
    ELSE slug
END
WHERE category IS NULL
  AND (slug IS NULL OR btrim(slug) = '');

-- ══════════════════════════════════════
-- 2) Child items (category IS NOT NULL)
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = CASE name
    -- 기업 세미나 children
    WHEN '워크숍' THEN 'workshop'
    WHEN '이사회' THEN 'board-meeting'
    WHEN '총회' THEN 'general-meeting'
    -- 채용/교육 children
    WHEN '시험장' THEN 'exam-room'
    WHEN '대규모 교육' THEN 'large-training'
    WHEN '면접장' THEN 'interview-room'
    -- 전시/박람회 children
    WHEN '입주 박람회' THEN 'tenant-expo'
    WHEN '전시 부스' THEN 'exhibition-booth'
    -- IT/해커톤 children
    WHEN '코딩 대회' THEN 'coding-contest'
    WHEN 'e-스포츠' THEN 'esports'
    -- 사무실 children
    WHEN '임시 사무실' THEN 'temp-office'
    WHEN '임시사무실' THEN 'temp-office'
    WHEN '선거캠프 사무실' THEN 'campaign-office'
    WHEN '선거캠프사무실' THEN 'campaign-office'
    WHEN '건설현장 사무실' THEN 'construction-office'
    WHEN '건설현장사무실' THEN 'construction-office'
    WHEN '모델하우스 상담' THEN 'modelhouse-consulting'
    WHEN '모델하우스상담' THEN 'modelhouse-consulting'
    -- 학회/컨퍼런스 children
    WHEN '포스터 세션 전시' THEN 'poster-session'
    WHEN '등록 데스크' THEN 'registration-desk'
    WHEN 'VIP 연사' THEN 'vip-speaker'
    -- 관공서/행정 children
    WHEN '국정감사' THEN 'national-audit'
    WHEN '주민설명회' THEN 'public-hearing'
    WHEN '공공기관' THEN 'public-agency'
    -- 공연/축제 children
    WHEN '아티스트' THEN 'artist'
    WHEN 'MD샵' THEN 'md-shop'
    WHEN '안전/보관' THEN 'safety-storage'
    -- Legacy standalone slugs
    WHEN '학회' THEN 'academic-conference'
    WHEN '포럼' THEN 'forum'
    WHEN '컨퍼런스' THEN 'conference'
    WHEN '전시' THEN 'exhibition'
    WHEN '박람회' THEN 'expo'
    WHEN '공연' THEN 'performance'
    WHEN '축제' THEN 'festival'
    WHEN '행사장' THEN 'venue'
    WHEN '회의실' THEN 'meeting-room'
    WHEN '연회장' THEN 'banquet-hall'
    WHEN '호텔' THEN 'hotel'
    WHEN '숙박' THEN 'accommodation'
    WHEN '운송' THEN 'transportation'
    WHEN '케이터링' THEN 'catering'
    WHEN '장비' THEN 'equipment'
    WHEN '음향' THEN 'audio'
    WHEN '조명' THEN 'lighting'
    WHEN '영상' THEN 'video'
    WHEN '통역' THEN 'interpretation'
    WHEN '등록' THEN 'registration'
    WHEN '인쇄' THEN 'printing'
    WHEN '기념품' THEN 'gift'
    WHEN '관공서' THEN 'public-sector'
    WHEN '정부기관' THEN 'government'
    WHEN '채용' THEN 'recruitment'
    WHEN '교육' THEN 'education'
    ELSE slug
END
WHERE category IS NOT NULL
  AND (slug IS NULL OR btrim(slug) = '');
