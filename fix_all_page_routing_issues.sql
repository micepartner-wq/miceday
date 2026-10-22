-- ════════════════════════════════════════════════════════════════
-- Fix all slug collisions, product category misassignments, and
-- missing slugs identified in the page audit.
--
-- Run AFTER:
--   1) add_nav_menu_slug.sql
--   2) backfill_nav_menu_slugs.sql
--
-- Safe to run multiple times.
-- ════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════
-- FIX 1: Slug collision — "포스터 세션 전시" uses 'exhibition' slug
--        which collides with parent group "전시/박람회".
--        Change child slug to 'poster-session'.
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'poster-session'
WHERE name = '포스터 세션 전시'
  AND (slug IS NULL OR slug = 'exhibition' OR slug = 'poster-session');

-- ══════════════════════════════════════
-- FIX 2: Parent "전시/박람회" needs unique slug 'exhibition-expo'
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'exhibition-expo'
WHERE name IN ('전시/박람회', '전시/ 박람회')
  AND category IS NULL;

-- ══════════════════════════════════════
-- FIX 3: Parent "학회/컨퍼런스" needs slug 'academic-conference'
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'academic-conference'
WHERE name IN ('학회/컨퍼런스', '학회/ 컨퍼런스')
  AND category IS NULL;

-- ══════════════════════════════════════
-- FIX 4: Slug collision — child "공연/엔터" or similar under different
--        parent may use 'performance' slug, colliding with "공연/축제".
--        Rename child slug to 'entertainment'.
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'entertainment'
WHERE slug = 'performance'
  AND category IS NOT NULL;

-- Parent "공연/축제" needs slug 'performance-festival'
UPDATE public.nav_menu_items
SET slug = 'performance-festival'
WHERE name IN ('공연/축제', '공연/ 축제')
  AND category IS NULL;

-- ══════════════════════════════════════
-- FIX 5: Parent "관공서/행정" slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'public-administration'
WHERE name IN ('관공서/행정', '관공서/ 행정')
  AND category IS NULL;

-- ══════════════════════════════════════
-- FIX 6: Parent "IT/해커톤" slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'it-hackathon'
WHERE name IN ('IT/해커톤', 'IT/ 해커톤')
  AND category IS NULL;

-- ══════════════════════════════════════
-- FIX 7: Product category — 주주총회 패키지가 워크숍에 잘못 배정됨
--        이사회 카테고리로 이동
-- ══════════════════════════════════════
UPDATE public.products
SET category = '이사회'
WHERE name LIKE '%주주총회%'
  AND category IN ('워크숍', 'workshop');

-- ══════════════════════════════════════
-- FIX 8: 등록 데스크 child slug (prevent collision with '등록')
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'registration-desk'
WHERE name = '등록 데스크';

-- ══════════════════════════════════════
-- FIX 9: VIP 연사 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'vip-speaker'
WHERE name = 'VIP 연사';

-- ══════════════════════════════════════
-- FIX 10: 전시 부스 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'exhibition-booth'
WHERE name = '전시 부스';

-- ══════════════════════════════════════
-- FIX 11: 입주 박람회 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'tenant-expo'
WHERE name = '입주 박람회';

-- ══════════════════════════════════════
-- FIX 12: 코딩 대회 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'coding-contest'
WHERE name = '코딩 대회';

-- ══════════════════════════════════════
-- FIX 13: e-스포츠 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'esports'
WHERE name = 'e-스포츠';

-- ══════════════════════════════════════
-- FIX 14: 대규모 교육 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'large-training'
WHERE name = '대규모 교육';

-- ══════════════════════════════════════
-- FIX 15: 국정감사 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'national-audit'
WHERE name = '국정감사';

-- ══════════════════════════════════════
-- FIX 16: 주민설명회 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'public-hearing'
WHERE name = '주민설명회';

-- ══════════════════════════════════════
-- FIX 17: 아티스트 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'artist'
WHERE name = '아티스트';

-- ══════════════════════════════════════
-- FIX 18: MD샵 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'md-shop'
WHERE name IN ('MD샵', 'MD삼');

-- ══════════════════════════════════════
-- FIX 19: 안전/보관 child slug
-- ══════════════════════════════════════
UPDATE public.nav_menu_items
SET slug = 'safety-storage'
WHERE name = '안전/보관';
