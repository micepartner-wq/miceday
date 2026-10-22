-- Normalize office/recruitment menu slugs to canonical routing.
-- Safe to run multiple times.

UPDATE public.nav_menu_items
SET slug = 'office'
WHERE name IN ('사무실', '오피스');

UPDATE public.nav_menu_items
SET slug = 'meeting-room'
WHERE name = '회의실';

UPDATE public.nav_menu_items
SET slug = 'exam-room'
WHERE name = '시험장';

UPDATE public.nav_menu_items
SET slug = 'interview-room'
WHERE name = '면접장';

UPDATE public.nav_menu_items
SET slug = 'recruitment-training'
WHERE name IN ('채용/교육', '채용교육', '채용 / 교육');

UPDATE public.nav_menu_items
SET slug = 'recruitment'
WHERE name = '채용';

UPDATE public.nav_menu_items
SET slug = 'education'
WHERE name = '교육';
