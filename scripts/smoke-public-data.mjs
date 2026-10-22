import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://zwxvjlnzhjmsuwjnwvqv.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inp3eHZqbG56aGptc3V3am53dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODcwNjIsImV4cCI6MjA4NTE2MzA2Mn0.GA0nRGSMr9XxXHc1VhpSeSB2hnaZknO2ojedpsTWrw4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CHECKS = [
  {
    name: 'nav_menu_items',
    required: true,
    run: async () =>
      supabase
        .from('nav_menu_items')
        .select('id,name,link,category,display_order,is_active', { count: 'exact' })
        .order('display_order', { ascending: true })
        .limit(20),
  },
  {
    name: 'tab_menu_items',
    required: false,
    run: async () =>
      supabase
        .from('tab_menu_items')
        .select('id,name,link,display_order,is_active', { count: 'exact' })
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(20),
  },
  {
    name: 'quick_menu_items',
    required: false,
    run: async () =>
      supabase
        .from('quick_menu_items')
        .select('id,name,link,image_url,display_order,is_active', { count: 'exact' })
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(20),
  },
  {
    name: 'hero_banners',
    required: false,
    run: async () =>
      supabase
        .from('banners')
        .select('id,title,image_url,display_order,is_active', { count: 'exact' })
        .eq('is_active', true)
        .eq('banner_type', 'hero')
        .order('display_order', { ascending: true })
        .limit(10),
  },
  {
    name: 'sections',
    required: false,
    run: async () =>
      supabase
        .from('sections')
        .select('id,name,display_order,is_active', { count: 'exact' })
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(20),
  },
  {
    name: 'products',
    required: true,
    run: async () =>
      supabase
        .from('products')
        .select('id,name,category,product_type,image_url,created_at', { count: 'exact' })
        .not('product_type', 'in', '(essential,additional,cooperative,place,food)')
        .order('created_at', { ascending: false })
        .limit(12),
  },
];

const summarizeSample = (rows) =>
  rows.slice(0, 3).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    hasImage: Boolean(row.image_url),
  }));

async function runCheck(check) {
  const startedAt = Date.now();

  try {
    const { data, error, count } = await check.run();
    if (error) {
      throw error;
    }

    const rows = data || [];
    const durationMs = Date.now() - startedAt;
    const hasRows = rows.length > 0;
    const missingImages = rows.filter((row) => 'image_url' in row && !row.image_url).length;

    return {
      name: check.name,
      required: check.required,
      ok: !check.required || hasRows,
      count: count ?? rows.length,
      sample: summarizeSample(rows),
      missingImages,
      durationMs,
    };
  } catch (error) {
    const normalizedError =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : String(error);

    return {
      name: check.name,
      required: check.required,
      ok: false,
      error: normalizedError,
      durationMs: Date.now() - startedAt,
    };
  }
}

async function main() {
  const results = await Promise.all(CHECKS.map(runCheck));
  const hardFailures = results.filter((result) => !result.ok && result.required);
  const softFailures = results.filter((result) => !result.ok && !result.required);

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    hardFailures: hardFailures.length,
    softFailures: softFailures.length,
    results,
  }, null, 2));

  if (hardFailures.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
