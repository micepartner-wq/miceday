ALTER TABLE public.nav_menu_items
ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS nav_menu_items_parent_slug_unique_idx
ON public.nav_menu_items (lower(slug))
WHERE category IS NULL AND slug IS NOT NULL AND btrim(slug) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS nav_menu_items_child_slug_unique_idx
ON public.nav_menu_items (category, lower(slug))
WHERE category IS NOT NULL AND slug IS NOT NULL AND btrim(slug) <> '';

COMMENT ON COLUMN public.nav_menu_items.slug IS
'Public category URL slug. Use lowercase English words and hyphens, for example corporate-seminar.';
