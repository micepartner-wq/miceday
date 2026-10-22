import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://zwxvjlnzhjmsuwjnwvqv.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inp3eHZqbG56aGptc3V3am53dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODcwNjIsImV4cCI6MjA4NTE2MzA2Mn0.GA0nRGSMr9XxXHc1VhpSeSB2hnaZknO2ojedpsTWrw4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const normalizeLabel = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()\-_/.,]/g, '');

async function main() {
  const [{ data: navItems, error: navError }, { data: products, error: productError }] = await Promise.all([
    supabase
      .from('nav_menu_items')
      .select('id,name,category,is_active,display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('products')
      .select('id,name,category,product_type')
      .not('product_type', 'in', '(essential,additional,cooperative,place,food)'),
  ]);

  if (navError) throw navError;
  if (productError) throw productError;

  const parents = (navItems || []).filter((item) => !item.category);
  const children = (navItems || []).filter((item) => Boolean(item.category));

  const menuCategories = new Set(
    [...parents.map((item) => item.name), ...children.map((item) => item.name)].filter(Boolean),
  );
  const normalizedMenuCategories = new Set(
    [...menuCategories].map((name) => normalizeLabel(name)),
  );

  const productCategories = Array.from(
    new Set((products || []).map((product) => product.category).filter(Boolean)),
  );
  const normalizedProductCategoryMap = new Map(
    productCategories.map((name) => [normalizeLabel(name), name]),
  );

  const missingProductCategories = [...menuCategories]
    .filter((name) => !normalizedProductCategoryMap.has(normalizeLabel(name)))
    .sort((a, b) => a.localeCompare(b, 'ko-KR'));

  const unknownProductCategories = productCategories
    .filter((name) => !normalizedMenuCategories.has(normalizeLabel(name)))
    .sort((a, b) => a.localeCompare(b, 'ko-KR'));

  const childWithoutProducts = children
    .map((child) => {
      const normalizedChild = normalizeLabel(child.name);
      const count = (products || []).filter(
        (product) => normalizeLabel(product.category) === normalizedChild,
      ).length;
      return { child: child.name, parent: child.category, count };
    })
    .filter((entry) => entry.count === 0)
    .sort((a, b) => a.parent.localeCompare(b.parent, 'ko-KR') || a.child.localeCompare(b.child, 'ko-KR'));

  const report = {
    checkedAt: new Date().toISOString(),
    navMenuCount: (navItems || []).length,
    productCount: (products || []).length,
    missingProductCategories,
    unknownProductCategories,
    childWithoutProducts,
  };

  console.log(JSON.stringify(report, null, 2));

  if (missingProductCategories.length > 0 || unknownProductCategories.length > 0 || childWithoutProducts.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

