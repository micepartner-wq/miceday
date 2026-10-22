-- Normalize office-related product categories to canonical labels used by routing/menu.
-- Safe to run multiple times.

-- 1) Office parent variants -> '사무실'
UPDATE public.products
SET category = '사무실'
WHERE category IN ('오피스', '업무공간', '사무 공간', 'office', 'workspace');

-- 2) Child variants under office/recruitment domain
UPDATE public.products
SET category = '회의실'
WHERE category IN ('회의 룸', '미팅룸', 'meeting-room', 'conference-room');

UPDATE public.products
SET category = '시험장'
WHERE category IN ('시험장소', '시험 공간', 'exam', 'exam-room');

UPDATE public.products
SET category = '면접장'
WHERE category IN ('면접실', '인터뷰룸', 'interview', 'interview-room');

-- 3) Recruitment/education parent variants -> '채용/교육'
UPDATE public.products
SET category = '채용/교육'
WHERE category IN ('채용교육', '채용 / 교육', 'recruitment-training', 'recruit-training');
