-- Align office tab button labels with product categories and menu slugs.
-- Target labels:
-- - 임시 사무실
-- - 선거캠프 사무실
-- - 건설현장 사무실
-- - 모델하우스 상담
--
-- Run order recommendation:
-- 1) add_nav_menu_slug.sql (if not applied yet)
-- 2) normalize_office_button_categories.sql

-- =========================
-- 1) nav_menu_items slugs
-- =========================
UPDATE public.nav_menu_items
SET slug = 'office'
WHERE name IN ('사무실', '오피스');

UPDATE public.nav_menu_items
SET slug = 'temp-office'
WHERE name IN ('임시 사무실', '임시사무실');

UPDATE public.nav_menu_items
SET slug = 'campaign-office'
WHERE name IN ('선거캠프 사무실', '선거캠프사무실');

UPDATE public.nav_menu_items
SET slug = 'construction-office'
WHERE name IN ('건설현장 사무실', '건설현장사무실');

UPDATE public.nav_menu_items
SET slug = 'modelhouse-consulting'
WHERE name IN ('모델하우스 상담', '모델하우스상담');

-- Keep these child menus under office group when parent text varies.
UPDATE public.nav_menu_items
SET category = '사무실'
WHERE name IN ('임시 사무실', '임시사무실', '선거캠프 사무실', '선거캠프사무실', '건설현장 사무실', '건설현장사무실', '모델하우스 상담', '모델하우스상담')
  AND category IN ('오피스', '업무공간', '사무 공간');

-- =========================
-- 2) products.category normalize
-- =========================
UPDATE public.products
SET category = '사무실'
WHERE category IN ('오피스', '업무공간', '사무 공간', 'office', 'workspace');

UPDATE public.products
SET category = '임시 사무실'
WHERE category IN ('임시사무실', 'temp-office');

UPDATE public.products
SET category = '선거캠프 사무실'
WHERE category IN ('선거캠프사무실', 'campaign-office');

UPDATE public.products
SET category = '건설현장 사무실'
WHERE category IN ('건설현장사무실', 'construction-office');

UPDATE public.products
SET category = '모델하우스 상담'
WHERE category IN ('모델하우스상담', 'modelhouse-consulting');
