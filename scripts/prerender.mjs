import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const SITE_URL = 'https://miceday.co.kr';
const SITE_NAME = '행사어때';
const SITE_TITLE = '행사어때 | 대전 MICE 행사 통합운영 플랫폼';
const SITE_DESCRIPTION =
  '행사어때는 대전·충청권 MICE 행사에 필요한 기획, 장비 렌탈, 공간 연출, 운영 지원을 한 번에 제공하는 행사 통합운영 플랫폼입니다.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo_card.jpg`;
const ORGANIZATION_LOGO = `${SITE_URL}/Miceday_Logo.png`;
const INDEX_ROBOTS =
  'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex,follow';

const ORGANIZATION = {
  legalName: SITE_NAME,
  representative: '이기석',
  phone: '1800-1985',
  officePhone: '010-4074-6967',
  email: 'hm_solution@naver.com',
  address: {
    streetAddress: '대전광역시 대덕구 대화로106번길 66 펜타플렉스 705호, 706호',
    postalCode: '34365',
    addressLocality: '대전광역시',
    addressCountry: 'KR',
  },
};

const staticRoutes = [
  {
    route: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    canonical: '/',
    robots: INDEX_ROBOTS,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: ORGANIZATION.legalName,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        legalName: ORGANIZATION.legalName,
        alternateName: [SITE_NAME],
        url: SITE_URL,
        logo: ORGANIZATION_LOGO,
        email: ORGANIZATION.email,
        telephone: ORGANIZATION.officePhone,
        founder: ORGANIZATION.representative,
        address: {
          '@type': 'PostalAddress',
          streetAddress: ORGANIZATION.address.streetAddress,
          postalCode: ORGANIZATION.address.postalCode,
          addressLocality: ORGANIZATION.address.addressLocality,
          addressCountry: ORGANIZATION.address.addressCountry,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: ORGANIZATION.phone,
          contactType: 'customer service',
          areaServed: 'KR',
          availableLanguage: ['ko'],
        },
      },
    ],
  },
  {
    route: '/products',
    title: '전체 상품 | 행사어때',
    description:
      '행사어때 전체 상품 목록입니다. 대전 MICE 행사 운영에 필요한 장비와 서비스를 한 곳에서 비교하고 상담할 수 있습니다.',
    canonical: '/products',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/company',
    title: '회사소개 | 행사어때',
    description:
      '행사어때 회사소개 공식 홈페이지에서 확인할 수 있습니다.',
    canonical: 'https://micepartner.co.kr/',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/cs',
    title: '고객센터 | 행사어때',
    description:
      '행사어때 고객센터입니다. 자주 묻는 질문, 전화 상담, 채팅 상담 안내를 확인할 수 있습니다.',
    canonical: '/cs',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/alliance',
    title: '대전·충청 MICE 얼라이언스 회원사 소개 | 행사어때',
    description: '대전·충청 MICE 얼라이언스(DCMA) 회원사 소개와 안내를 확인할 수 있습니다.',
    canonical: '/alliance',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/cases',
    title: '설치사례 | 행사어때',
    description: '행사어때 설치사례 페이지입니다. 현장 설치 및 운영 사례를 확인할 수 있습니다.',
    canonical: '/cases',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/notices',
    title: '공지사항 | 행사어때',
    description: '행사어때 공지사항 페이지입니다. 서비스 공지 및 운영 소식을 확인할 수 있습니다.',
    canonical: '/notices',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/terms',
    title: '서비스 이용약관 | 행사어때',
    description:
      '행사어때 서비스 이용약관입니다. 회원가입, 예약, 결제, 취소 및 환불, 권리와 의무 사항을 안내합니다.',
    canonical: '/terms',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/privacy',
    title: '개인정보처리방침 | 행사어때',
    description:
      '행사어때 서비스의 개인정보처리방침입니다. 수집 항목, 이용 목적, 보유 기간, 이용자 권리 및 보호조치를 안내합니다.',
    canonical: '/privacy',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/login',
    title: '로그인 | 행사어때',
    description: '행사어때 회원 로그인 페이지입니다.',
    canonical: '/login',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/signup',
    title: '회원가입 | 행사어때',
    description:
      '행사어때 회원가입 페이지입니다. 기업과 공공기관을 위한 행사 통합운영 서비스를 신청할 수 있습니다.',
    canonical: '/signup',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/mypage',
    title: '내 예약 내역 | 행사어때',
    description: '행사어때 회원 전용 예약 내역 페이지입니다.',
    canonical: '/mypage',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/mypage/info',
    title: '내 정보 관리 | 행사어때',
    description: '행사어때 회원 전용 내 정보 관리 페이지입니다.',
    canonical: '/mypage/info',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/mypage/inquiry',
    title: '1:1 문의 내역 | 행사어때',
    description: '행사어때 회원 전용 1:1 문의 페이지입니다.',
    canonical: '/mypage/inquiry',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/search',
    title: '검색 결과 | 행사어때',
    description: '행사어때 사이트 검색 결과 페이지입니다.',
    canonical: '/search',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/event',
    title: '이벤트 준비중 | 행사어때',
    description: '행사어때 이벤트 페이지 준비중입니다.',
    canonical: '/event',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/blank',
    title: '페이지 준비중 | 행사어때',
    description: '행사어때 신규 페이지 준비중입니다.',
    canonical: '/blank',
    robots: NOINDEX_ROBOTS,
  },
  {
    route: '/404',
    title: '페이지를 찾을 수 없습니다 | 행사어때',
    description: '요청하신 페이지를 찾을 수 없습니다.',
    canonical: '/404',
    robots: NOINDEX_ROBOTS,
  },
  // --- Service Category Routes ---
  {
    route: '/service/corporate-seminar',
    title: '기업 세미나 행사 장비 및 운영 | 행사어때',
    description: '성공적인 기업 세미나와 워크숍, 이사회를 위한 공간 대관부터 장비 렌탈, 현장 운영까지 행사어때가 함께합니다.',
    canonical: '/service/corporate-seminar',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/service/recruitment-training',
    title: '채용 및 교육 행사 지원 | 행사어때',
    description: '대규모 시험장, 면접장 구축부터 원활한 교육 진행을 위한 맞춤형 환경 조성 서비스를 제공합니다.',
    canonical: '/service/recruitment-training',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/service/exhibition-expo',
    title: '전시 및 박람회 통합 운영 | 행사어때',
    description: '전시 부스 구축, 입주 박람회 기획 및 운영. 돋보이는 공간 연출로 성공적인 전시를 지원합니다.',
    canonical: '/service/exhibition-expo',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/service/it-hackathon',
    title: 'IT 컨퍼런스 및 해커톤 행사 | 행사어때',
    description: '코딩 대회, e-스포츠, 해커톤 운영에 필수적인 고사양 네트워크와 전력, 맞춤형 장비를 지원합니다.',
    canonical: '/service/it-hackathon',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/service/office',
    title: '임시 사무실 구축 및 렌탈 | 행사어때',
    description: '건설현장, 선거캠프, 모델하우스 등 단기 프로젝트를 위한 완벽한 임시 사무실 환경을 신속하게 구축합니다.',
    canonical: '/service/office',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/service/academic-conference',
    title: '학회 및 컨퍼런스 기획 운영 | 행사어때',
    description: '포스터 세션 전시, 등록 데스크 운영, VIP 의전까지 학술 행사의 품격을 높이는 전문 서비스를 제공합니다.',
    canonical: '/service/academic-conference',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/service/public-administration',
    title: '관공서 및 행정 행사 대행 | 행사어때',
    description: '주민설명회, 국정감사, 공공기관 행사. 신뢰와 안전을 최우선으로 규정에 맞는 완벽한 행사를 운영합니다.',
    canonical: '/service/public-administration',
    robots: INDEX_ROBOTS,
  },
  {
    route: '/service/performance-festival',
    title: '공연 및 축제 기획 운영 | 행사어때',
    description: '아티스트 섭외, MD샵 구성, 안전/보관소 운영까지. 관람객에게 잊지 못할 즐거움을 선사하는 축제를 만듭니다.',
    canonical: '/service/performance-festival',
    robots: INDEX_ROBOTS,
  },
];

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteUrl(pathOrUrl = '/') {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, maxLength = 160) {
  if (!value) return '';
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}...`;
}

function upsertTag(html, pattern, tag, anchor = '</head>') {
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace(anchor, `  ${tag}\n${anchor}`);
}

function buildJsonLdScripts(schemas = []) {
  if (!schemas.length) return '';

  return `${schemas
    .map(
      (schema) =>
        `  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n')}\n`;
}

function renderHtml(baseHtml, meta) {
  const title = escapeHtml(meta.title || SITE_TITLE);
  const description = escapeHtml(meta.description || SITE_DESCRIPTION);
  const canonical = escapeHtml(absoluteUrl(meta.canonical || '/'));
  const robots = escapeHtml(meta.robots || INDEX_ROBOTS);
  const image = escapeHtml(absoluteUrl(meta.image || DEFAULT_OG_IMAGE));
  const type = escapeHtml(meta.type || 'website');
  const jsonLdScripts = buildJsonLdScripts(meta.jsonLd || []);

  let html = baseHtml.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"></div>');

  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  html = upsertTag(
    html,
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${description}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i,
    `<meta name="robots" content="${robots}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:type" content="${type}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${title}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${description}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${image}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>|<meta\s+property="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${description}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image" content="${image}" />`
  );

  if (jsonLdScripts) {
    html = html.replace('</head>', `${jsonLdScripts}</head>`);
  }

  // Visible initial content: React replaces this when the application mounts.
  // Do not include account-specific content or raw CMS HTML in the static shell.
  if (!(meta.robots || INDEX_ROBOTS).includes('noindex')) {
    const links = meta.bodyLinks || [
      { href: '/products', title: '행사 장비와 서비스' },
      { href: '/cases', title: '현장사례' },
      { href: '/contact', title: '행사 상담하기' },
    ];
    const homeContent = meta.canonical === '/' ? '<h2>기획부터 현장 운영까지</h2><p>장소 섭외부터 음향·케이터링·현장 운영까지 한 번에.</p><ul><li>전시 부스 및 무대 시공</li><li>운영 비품 및 인쇄물</li><li>전문 인력 및 현장 디렉팅</li></ul>' : '';
    const body = `<main style="max-width:960px;margin:0 auto;padding:64px 24px"><a href="/">행사어때</a><h1>${title}</h1><p>${description}</p>${homeContent}<nav aria-label="관련 페이지"><ul>${links.map(link => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.title)}</a></li>`).join('')}</ul></nav></main>`;
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${body}</div>`);
  }
  return html;
}

async function writeRouteHtml(route, html) {
  if (route === '/') {
    await writeFile(path.join(DIST_DIR, 'index.html'), html, 'utf8');
    return;
  }

  const relativePath = route.replace(/^\/+/, '');
  const outputDir = path.join(DIST_DIR, relativePath);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), html, 'utf8');

  if (route === '/404') {
    await writeFile(path.join(DIST_DIR, '404.html'), html, 'utf8');
  }
}

async function readSupabaseConfig() {
  try {
    const source = await readFile(path.join(ROOT_DIR, 'src', 'lib', 'supabase.ts'), 'utf8');
    const urlMatch = source.match(/const supabaseUrl = '([^']+)'/);
    const keyMatch = source.match(/const supabaseAnonKey = '([^']+)'/);

    if (!urlMatch || !keyMatch) {
      return null;
    }

    return {
      url: urlMatch[1],
      anonKey: keyMatch[1],
    };
  } catch (error) {
    console.warn('[prerender] Unable to read Supabase config:', error);
    return null;
  }
}

function getSupabaseHeaders(config) {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
  };
}

async function fetchSupabaseRows(config, endpoint) {
  const response = await fetch(`${config.url}/rest/v1/${endpoint}`, {
    headers: getSupabaseHeaders(config),
  });

  if (!response.ok) {
    throw new Error(`Supabase responded with ${response.status}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function toDateOnly(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

async function fetchProductPages(config) {
  if (!config) {
    return [];
  }

  try {
    return await fetchSupabaseRows(
      config,
      'products?select=id,product_code,name,category,price,stock,description,short_description,image_url,created_at&product_type=eq.basic&order=created_at.desc'
    );
  } catch (error) {
    console.warn('[prerender] Product fetch failed, continuing without product detail prerender:', error);
    return [];
  }
}

async function fetchNoticePages(config) {
  if (!config) {
    return [];
  }

  try {
    return await fetchSupabaseRows(
      config,
      'notices?select=id,title,summary,image_url,published_at,updated_at,created_at&is_active=eq.true&order=published_at.desc'
    );
  } catch (error) {
    console.warn('[prerender] Notice fetch failed, continuing without notice detail prerender:', error);
    return [];
  }
}

async function fetchInstallationCasePages(config) {
  if (!config) {
    return [];
  }

  try {
    return await fetchSupabaseRows(
      config,
      'installation_cases?select=id,title,summary,image_url,published_at,updated_at,created_at&is_active=eq.true&order=published_at.desc'
    );
  } catch (error) {
    console.warn('[prerender] Installation case fetch failed, continuing without case detail prerender:', error);
    return [];
  }
}

async function fetchAllianceMemberPages(config) {
  if (!config) {
    return [];
  }

  try {
    return await fetchSupabaseRows(
      config,
      'alliance_members?select=id,name,category1,address,phone,logo_url,created_at&is_active=eq.true&order=display_order.asc'
    );
  } catch (error) {
    console.warn('[prerender] Alliance member fetch failed, continuing without alliance detail prerender:', error);
    return [];
  }
}

function buildProductDescription(product) {
  const rawDescription =
    product.short_description ||
    "행사를 더욱 전문적이고 체계적으로 준비하세요. 행사어때가 제안하는 맞춤형 종합 솔루션.";

  return truncate(rawDescription, 160);
}

function buildProductSchemas(product, canonicalUrl, imageUrl, description) {
  return [
    buildBreadcrumbSchema([
      { name: '홈', item: SITE_URL },
      { name: '상품', item: `${SITE_URL}/products` },
      { name: product.name, item: canonicalUrl },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: [imageUrl],
      description,
      sku: product.product_code || product.id,
      category: product.category || undefined,
      brand: {
        '@type': 'Brand',
        name: SITE_NAME,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'KRW',
        price: String(product.price || 0),
        availability:
          product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        url: canonicalUrl,
        itemCondition: 'https://schema.org/NewCondition',
      },
    },
  ];
}

function buildNoticeDescription(notice) {
  return truncate(
    notice.summary || `${notice.title} 공지사항 상세 페이지입니다.`,
    160
  );
}

function buildInstallationCaseDescription(item) {
  return truncate(
    item.summary || `${item.title} 설치사례 상세 페이지입니다.`,
    160
  );
}

function buildAllianceDescription(member) {
  const contextParts = [member.category1, member.address, member.phone].filter(Boolean);
  const rawDescription = contextParts.length > 0
    ? `${member.name} | ${contextParts.join(' · ')}`
    : `${member.name} 회원사 상세 페이지입니다.`;

  return truncate(rawDescription, 160);
}

function buildArticleSchemas({ listName, listUrl, title, canonicalUrl, imageUrl, description, publishedAt, modifiedAt }) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(modifiedAt ? { dateModified: modifiedAt } : {}),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: ORGANIZATION_LOGO,
      },
    },
    mainEntityOfPage: canonicalUrl,
  };

  return [
    buildBreadcrumbSchema([
      { name: '홈', item: SITE_URL },
      { name: listName, item: listUrl },
      { name: title, item: canonicalUrl },
    ]),
    articleSchema,
  ];
}

function buildAllianceSchemas(member, canonicalUrl, imageUrl, description) {
  return [
    buildBreadcrumbSchema([
      { name: '홈', item: SITE_URL },
      { name: '회원사', item: `${SITE_URL}/alliance` },
      { name: member.name, item: canonicalUrl },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: member.name,
      url: canonicalUrl,
      description,
      ...(imageUrl ? { logo: imageUrl, image: [imageUrl] } : {}),
      ...(member.phone ? { telephone: member.phone } : {}),
      ...(member.address
        ? {
            address: {
              '@type': 'PostalAddress',
              streetAddress: member.address,
              addressCountry: 'KR',
            },
          }
        : {}),
      ...(member.category1
        ? {
            knowsAbout: [member.category1],
            memberOf: {
              '@type': 'Organization',
              name: '대전·충청 MICE 얼라이언스',
            },
          }
        : {}),
    },
  ];
}

const xmlEscape = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// /alliance routes currently render NotFound in the app, so they are left out of the sitemap.
async function writeSitemap({ servicePaths, products, notices, installationCases }) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];
  const seen = new Set();
  const add = (routePath, changefreq, priority, lastmod = today) => {
    if (seen.has(routePath)) return;
    seen.add(routePath);
    const date = toDateOnly(lastmod) || today;
    entries.push(
      `  <url>
    <loc>${xmlEscape(absoluteUrl(routePath))}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    );
  };

  add('/', 'daily', '1.0');
  add('/products', 'daily', '0.8');
  servicePaths.forEach(servicePath => add(servicePath, 'weekly', '0.9'));
  add('/cases', 'monthly', '0.6');
  add('/notices', 'monthly', '0.6');
  add('/cs', 'monthly', '0.6');
  add('/terms', 'yearly', '0.3');
  add('/privacy', 'yearly', '0.3');

  products.filter(item => item?.id).forEach(item => add(`/products/${item.id}`, 'weekly', '0.7', item.created_at));
  notices.filter(item => item?.id).forEach(item =>
    add(`/notices/${item.id}`, 'weekly', '0.7', item.updated_at || item.published_at || item.created_at));
  installationCases.filter(item => item?.id).forEach(item =>
    add(`/cases/${item.id}`, 'weekly', '0.7', item.updated_at || item.published_at || item.created_at));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`[prerender] Wrote sitemap.xml with ${entries.length} URLs.`);
}

async function main() {
  const baseHtml = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
  const supabaseConfig = await readSupabaseConfig();

  // The sitemap Cloud Function needs the Blaze plan, so generate a static sitemap.xml instead.
  const staticSitemap = await readFile(path.join(DIST_DIR, 'sitemap.xml'), 'utf8').catch(() => '');
  const servicePaths = [...staticSitemap.matchAll(/<loc>https:\/\/miceday\.co\.kr(\/service\/[^<]*)<\/loc>/g)].map(m => m[1]);

  for (const route of staticRoutes) {
    const html = renderHtml(baseHtml, route);
    await writeRouteHtml(route.route, html);
  }

  const [products, notices, installationCases, allianceMembers] = await Promise.all([
    fetchProductPages(supabaseConfig),
    fetchNoticePages(supabaseConfig),
    fetchInstallationCasePages(supabaseConfig),
    fetchAllianceMemberPages(supabaseConfig),
  ]);

  await writeSitemap({ servicePaths, products, notices, installationCases });

  for (const [routePath, records, field] of [
    ['/products', products, 'name'], ['/cases', installationCases, 'title'], ['/notices', notices, 'title'],
  ]) {
    const route = staticRoutes.find(entry => entry.route === routePath);
    if (route) await writeRouteHtml(routePath, renderHtml(baseHtml, {
      ...route,
      bodyLinks: records.map(record => ({ href: `${routePath}/${encodeURIComponent(record.id)}`, title: record[field] })),
    }));
  }

  for (const product of products) {
    if (!product?.id || !product?.name) {
      continue;
    }

    const canonicalPath = `/products/${product.id}`;
    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = absoluteUrl(product.image_url || DEFAULT_OG_IMAGE);
    const description = buildProductDescription(product);

    const html = renderHtml(baseHtml, {
      title: `행사어때 - ${product.name}`,
      description,
      canonical: canonicalPath,
      robots: INDEX_ROBOTS,
      image: imageUrl,
      type: 'product',
      jsonLd: buildProductSchemas(product, canonicalUrl, imageUrl, description),
    });

    await writeRouteHtml(canonicalPath, html);
  }

  for (const notice of notices) {
    if (!notice?.id || !notice?.title) {
      continue;
    }

    const canonicalPath = `/notices/${notice.id}`;
    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = notice.image_url ? absoluteUrl(notice.image_url) : undefined;
    const description = buildNoticeDescription(notice);

    const html = renderHtml(baseHtml, {
      title: `${notice.title} | 행사어때`,
      description,
      canonical: canonicalPath,
      robots: INDEX_ROBOTS,
      image: imageUrl || DEFAULT_OG_IMAGE,
      type: 'article',
      jsonLd: buildArticleSchemas({
        listName: '공지사항',
        listUrl: `${SITE_URL}/notices`,
        title: notice.title,
        canonicalUrl,
        imageUrl,
        description,
        publishedAt: toDateOnly(notice.published_at || notice.created_at),
        modifiedAt: toDateOnly(notice.updated_at || notice.published_at || notice.created_at),
      }),
    });

    await writeRouteHtml(canonicalPath, html);
  }

  for (const item of installationCases) {
    if (!item?.id || !item?.title) {
      continue;
    }

    const canonicalPath = `/cases/${item.id}`;
    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = item.image_url ? absoluteUrl(item.image_url) : undefined;
    const description = buildInstallationCaseDescription(item);

    const html = renderHtml(baseHtml, {
      title: `${item.title} | 행사어때`,
      description,
      canonical: canonicalPath,
      robots: INDEX_ROBOTS,
      image: imageUrl || DEFAULT_OG_IMAGE,
      type: 'article',
      jsonLd: buildArticleSchemas({
        listName: '설치사례',
        listUrl: `${SITE_URL}/cases`,
        title: item.title,
        canonicalUrl,
        imageUrl,
        description,
        publishedAt: toDateOnly(item.published_at || item.created_at),
        modifiedAt: toDateOnly(item.updated_at || item.published_at || item.created_at),
      }),
    });

    await writeRouteHtml(canonicalPath, html);
  }

  for (const member of allianceMembers) {
    if (!member?.id || !member?.name) {
      continue;
    }

    const canonicalPath = `/alliance/${member.id}`;
    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = member.logo_url ? absoluteUrl(member.logo_url) : undefined;
    const description = buildAllianceDescription(member);

    const html = renderHtml(baseHtml, {
      title: `${member.name} | 행사어때`,
      description,
      canonical: canonicalPath,
      robots: INDEX_ROBOTS,
      image: imageUrl || DEFAULT_OG_IMAGE,
      type: 'website',
      jsonLd: buildAllianceSchemas(member, canonicalUrl, imageUrl, description),
    });

    await writeRouteHtml(canonicalPath, html);
  }

  console.log(
    `[prerender] Generated ${staticRoutes.length} static route HTML files, ${products.length} product detail HTML files, ${notices.length} notice detail HTML files, ${installationCases.length} installation case detail HTML files, and ${allianceMembers.length} alliance detail HTML files.`
  );
}

main().catch((error) => {
  console.error('[prerender] Build failed:', error);
  process.exit(1);
});
