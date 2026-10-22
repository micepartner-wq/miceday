import type { NavMenuItem } from '../api/cmsApi';

export const ALL_PRODUCTS_CATEGORY = '전체';
const PRODUCT_CATEGORY_BASE_PATH = '/service';

type ProductListRouteOptions = {
    category?: string | null;
    title?: string | null;
    sectionId?: string | null;
};

type CategoryRouteConfig = {
    name: string;
    slug: string;
    aliases?: string[];
};

const normalizeValue = (value?: string | null) => value?.trim() || '';

const CATEGORY_ROUTE_CONFIGS: CategoryRouteConfig[] = [
    { name: '전체', slug: 'all', aliases: ['all-products'] },
    // ── Parent groups ──
    { name: '기업 세미나', slug: 'corporate-seminar', aliases: ['seminar'] },
    { name: '채용/교육', slug: 'recruitment-training', aliases: ['recruit-training'] },
    { name: '전시/박람회', slug: 'exhibition-expo', aliases: ['exhibition-fair'] },
    { name: 'IT/해커톤', slug: 'it-hackathon', aliases: ['hackathon'] },
    { name: '사무실', slug: 'office', aliases: ['workspace'] },
    { name: '학회/컨퍼런스', slug: 'academic-conference', aliases: ['conference-academic'] },
    { name: '관공서/행정', slug: 'public-administration', aliases: ['public-sector', 'public-office'] },
    { name: '공연/축제', slug: 'performance-festival', aliases: ['show-festival'] },
    // ── 기업 세미나 children ──
    { name: '워크숍', slug: 'workshop', aliases: ['corporate-workshop'] },
    { name: '이사회', slug: 'board-meeting', aliases: ['board'] },
    { name: '총회', slug: 'general-meeting', aliases: ['general-assembly'] },
    // ── 채용/교육 children ──
    { name: '시험장', slug: 'exam-room', aliases: ['exam'] },
    { name: '대규모 교육', slug: 'large-training', aliases: ['mass-training'] },
    { name: '면접장', slug: 'interview-room', aliases: ['interview'] },
    // ── 전시/박람회 children ──
    { name: '입주 박람회', slug: 'tenant-expo', aliases: ['tenant-fair'] },
    { name: '전시 부스', slug: 'exhibition-booth', aliases: ['booth'] },
    // ── IT/해커톤 children ──
    { name: '코딩 대회', slug: 'coding-contest', aliases: ['coding'] },
    { name: 'e-스포츠', slug: 'esports', aliases: ['e-sports'] },
    // ── 사무실 children ──
    { name: '임시 사무실', slug: 'temp-office' },
    { name: '선거캠프 사무실', slug: 'campaign-office' },
    { name: '건설현장 사무실', slug: 'construction-office' },
    { name: '모델하우스 상담', slug: 'modelhouse-consulting' },
    // ── 학회/컨퍼런스 children ──
    { name: '포스터 세션 전시', slug: 'poster-session' },
    { name: '등록 데스크', slug: 'registration-desk' },
    { name: 'VIP 연사', slug: 'vip-speaker' },
    // ── 관공서/행정 children ──
    { name: '국정감사', slug: 'national-audit' },
    { name: '주민설명회', slug: 'public-hearing' },
    { name: '공공기관', slug: 'public-agency' },
    // ── 공연/축제 children ──
    { name: '아티스트', slug: 'artist' },
    { name: 'MD샵', slug: 'md-shop' },
    { name: '안전/보관', slug: 'safety-storage' },
    // ── Legacy / standalone (backward compat) ──
    { name: '학회', slug: 'academic-conference' },
    { name: '포럼', slug: 'forum' },
    { name: '컨퍼런스', slug: 'conference' },
    { name: '전시', slug: 'exhibition' },
    { name: '박람회', slug: 'expo', aliases: ['fair'] },
    { name: '공연', slug: 'performance' },
    { name: '축제', slug: 'festival' },
    { name: '관공서', slug: 'public-sector' },
    { name: '정부기관', slug: 'government' },
    { name: '오피스', slug: 'office' },
    { name: '채용', slug: 'recruitment', aliases: ['recruit'] },
    { name: '교육', slug: 'education', aliases: ['training'] },
    { name: '행사장', slug: 'venue' },
    { name: '회의실', slug: 'meeting-room' },
    { name: '연회장', slug: 'banquet-hall' },
    { name: '호텔', slug: 'hotel' },
    { name: '숙박', slug: 'accommodation' },
    { name: '운송', slug: 'transportation', aliases: ['transport'] },
    { name: '케이터링', slug: 'catering' },
    { name: '장비', slug: 'equipment' },
    { name: '음향', slug: 'audio' },
    { name: '조명', slug: 'lighting' },
    { name: '영상', slug: 'video' },
    { name: '통역', slug: 'interpretation' },
    { name: '등록', slug: 'registration' },
    { name: '인쇄', slug: 'printing' },
    { name: '기념품', slug: 'gift' },
];

const CATEGORY_ROUTE_MAP = new Map(
    CATEGORY_ROUTE_CONFIGS.map((config) => [config.name, config]),
);

const CATEGORY_ALIAS_TO_NAME = new Map<string, string>();

CATEGORY_ROUTE_CONFIGS.forEach((config) => {
    CATEGORY_ALIAS_TO_NAME.set(config.slug, config.name);
    config.aliases?.forEach((alias) => {
        CATEGORY_ALIAS_TO_NAME.set(alias, config.name);
    });
});

const TOKEN_TRANSLATIONS: Array<[RegExp, string]> = [
    // Compound parent groups (must come before simpler tokens)
    [/전시\/박람회/gi, 'exhibition-expo'],
    [/학회\/컨퍼런스/gi, 'academic-conference'],
    [/공연\/축제/gi, 'performance-festival'],
    [/관공서\/행정/gi, 'public-administration'],
    [/IT\/해커톤/gi, 'it-hackathon'],
    [/채용\/교육/gi, 'recruitment-training'],
    [/안전\/보관/gi, 'safety-storage'],
    // Compound child items (before simpler tokens)
    [/포스터\s*세션\s*전시/gi, 'poster-session'],
    [/등록\s*데스크/gi, 'registration-desk'],
    [/VIP\s*연사/gi, 'vip-speaker'],
    [/입주\s*박람회/gi, 'tenant-expo'],
    [/전시\s*부스/gi, 'exhibition-booth'],
    [/코딩\s*대회/gi, 'coding-contest'],
    [/e-?스포츠/gi, 'esports'],
    [/대규모\s*교육/gi, 'large-training'],
    [/임시\s*사무실/gi, 'temp-office'],
    [/선거캠프\s*사무실/gi, 'campaign-office'],
    [/건설현장\s*사무실/gi, 'construction-office'],
    [/모델하우스\s*상담/gi, 'modelhouse-consulting'],
    // Simple tokens
    [/기업/gi, 'corporate'],
    [/세미나/gi, 'seminar'],
    [/워크숍/gi, 'workshop'],
    [/이사회/gi, 'board-meeting'],
    [/총회/gi, 'general-meeting'],
    [/학회/gi, 'academic-conference'],
    [/포럼/gi, 'forum'],
    [/컨퍼런스/gi, 'conference'],
    [/전시/gi, 'exhibition'],
    [/박람회/gi, 'expo'],
    [/공연/gi, 'performance'],
    [/축제/gi, 'festival'],
    [/행사장/gi, 'venue'],
    [/회의실/gi, 'meeting-room'],
    [/연회장/gi, 'banquet-hall'],
    [/호텔/gi, 'hotel'],
    [/숙박/gi, 'accommodation'],
    [/운송/gi, 'transportation'],
    [/케이터링/gi, 'catering'],
    [/장비/gi, 'equipment'],
    [/음향/gi, 'audio'],
    [/조명/gi, 'lighting'],
    [/영상/gi, 'video'],
    [/통역/gi, 'interpretation'],
    [/등록/gi, 'registration'],
    [/인쇄/gi, 'printing'],
    [/기념품/gi, 'gift'],
    [/국정감사/gi, 'national-audit'],
    [/주민설명회/gi, 'public-hearing'],
    [/관공서/gi, 'public-sector'],
    [/공공기관/gi, 'public-agency'],
    [/정부기관/gi, 'government'],
    [/아티스트/gi, 'artist'],
    [/채용/gi, 'recruitment'],
    [/교육/gi, 'education'],
    [/사무실/gi, 'office'],
    [/오피스/gi, 'office'],
    [/시험장/gi, 'exam-room'],
    [/면접장/gi, 'interview-room'],
    [/서비스/gi, 'service'],
    [/[,&/]/g, ' '],
];

const toAsciiSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');

const findNavItemByName = (
    name: string,
    navMenuItems: NavMenuItem[] = [],
    parentName?: string | null,
) => {
    if (parentName) {
        const scopedMatch = navMenuItems.find(
            (item) => item.name === name && item.category === parentName,
        );
        if (scopedMatch) {
            return scopedMatch;
        }
    }

    return navMenuItems.find((item) => item.name === name);
};

export const slugifyCategoryName = (value?: string | null) => {
    const normalizedValue = normalizeValue(value);

    if (!normalizedValue) {
        return '';
    }

    const configuredRoute = CATEGORY_ROUTE_MAP.get(normalizedValue);
    if (configuredRoute) {
        return configuredRoute.slug;
    }

    let translated = normalizedValue;
    TOKEN_TRANSLATIONS.forEach(([pattern, replacement]) => {
        translated = translated.replace(pattern, ` ${replacement} `);
    });

    const asciiSlug = toAsciiSlug(translated);
    if (asciiSlug) {
        return asciiSlug;
    }

    return `category-${encodeURIComponent(normalizedValue).toLowerCase()}`;
};

export const resolveCategorySlug = (
    name: string,
    navMenuItems: NavMenuItem[] = [],
    parentName?: string | null,
) => {
    const configuredRoute = CATEGORY_ROUTE_MAP.get(normalizeValue(name));
    if (configuredRoute) {
        return configuredRoute.slug;
    }

    const navItem = findNavItemByName(name, navMenuItems, parentName);
    return normalizeValue(navItem?.slug) || slugifyCategoryName(name);
};

export const resolveCategoryNameFromSlug = (
    slug: string | null | undefined,
    navMenuItems: NavMenuItem[] = [],
    names: string[] = [],
    parentName?: string | null,
) => {
    const normalizedSlug = normalizeValue(slug).toLowerCase();

    if (!normalizedSlug) {
        return '';
    }

    const configuredMatch = CATEGORY_ALIAS_TO_NAME.get(normalizedSlug);
    if (configuredMatch) {
        // Exact match in names → return directly
        if (names.length === 0 || names.includes(configuredMatch)) {
            return configuredMatch;
        }

        // Fuzzy match: check for compound parent names like '전시/박람회'
        // when config returns a simple name like '전시'.
        const compoundMatch = names.find(
            (name) =>
                name.startsWith(configuredMatch + '/') ||
                name.endsWith('/' + configuredMatch) ||
                name.includes('/' + configuredMatch + '/'),
        );
        if (compoundMatch) {
            return compoundMatch;
        }
    }

    // DB slug lookup — prefer parent-level items when no parentName context
    const navMatch = parentName
        ? navMenuItems.find(
              (item) =>
                  item.category === parentName &&
                  normalizeValue(item.slug).toLowerCase() === normalizedSlug,
          )
        : navMenuItems.find(
              (item) =>
                  !item.category &&
                  normalizeValue(item.slug).toLowerCase() === normalizedSlug,
          );

    // Only fall back to any-item match when resolving child slugs (parentName given)
    if (!navMatch && parentName) {
        const anyMatch = navMenuItems.find(
            (item) => normalizeValue(item.slug).toLowerCase() === normalizedSlug,
        );
        if (anyMatch?.name) {
            return anyMatch.name;
        }
    }

    if (navMatch?.name) {
        return navMatch.name;
    }

    const searchPool =
        names.length > 0
            ? names
            : navMenuItems.flatMap((item) => [item.name, item.category || '']).filter(Boolean);

    const exactMatch = searchPool.find((name) => slugifyCategoryName(name) === normalizedSlug);
    return exactMatch || '';
};

export const buildProductListPath = ({
    category,
    title,
    sectionId,
}: ProductListRouteOptions = {}) => {
    const params = new URLSearchParams();
    const normalizedCategory = normalizeValue(category);
    const normalizedTitle = normalizeValue(title);
    const normalizedSectionId = normalizeValue(sectionId);

    if (normalizedSectionId) {
        params.set('sectionId', normalizedSectionId);
    }

    if (normalizedCategory && normalizedCategory !== ALL_PRODUCTS_CATEGORY) {
        params.set('category', normalizedCategory);
    }

    if (normalizedTitle) {
        params.set('title', normalizedTitle);
    }

    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : '/products';
};

export const appendTitleParam = (link: string, title?: string | null) => {
    const normalizedLink = normalizeValue(link);
    const normalizedTitle = normalizeValue(title);

    if (!normalizedLink || !normalizedTitle || normalizedLink.includes('title=')) {
        return normalizedLink;
    }

    const separator = normalizedLink.includes('?') ? '&' : '?';
    return `${normalizedLink}${separator}title=${encodeURIComponent(normalizedTitle)}`;
};

export const buildParentCategoryPath = (
    parentName: string,
    navMenuItems: NavMenuItem[] = [],
) => `${PRODUCT_CATEGORY_BASE_PATH}/${resolveCategorySlug(parentName, navMenuItems)}`;

export const buildChildCategoryPath = (
    parentName: string,
    childName: string,
    navMenuItems: NavMenuItem[] = [],
) =>
    `${PRODUCT_CATEGORY_BASE_PATH}/${resolveCategorySlug(parentName, navMenuItems)}/${resolveCategorySlug(
        childName,
        navMenuItems,
        parentName,
    )}`;

export const buildMenuGroupPath = (groupName: string, menuItems: NavMenuItem[]) => {
    const parentItem = menuItems.find((item) => item.name === groupName && !item.category);
    const hasChildren = menuItems.some((item) => item.is_active && item.category === groupName);

    if (!hasChildren && parentItem?.link && parentItem.link !== '#') {
        return appendTitleParam(parentItem.link, parentItem.name);
    }

    return buildParentCategoryPath(groupName, menuItems);
};

export const resolvePrettyCategoryPath = (
    category: string,
    parentToChildMap: Record<string, string[]>,
    childToParentMap: Record<string, string>,
    navMenuItems: NavMenuItem[] = [],
) => {
    const normalizedCategory = normalizeValue(category);

    if (!normalizedCategory || normalizedCategory === ALL_PRODUCTS_CATEGORY) {
        return '/products';
    }

    if (parentToChildMap[normalizedCategory]) {
        return buildParentCategoryPath(normalizedCategory, navMenuItems);
    }

    if (childToParentMap[normalizedCategory]) {
        return buildChildCategoryPath(
            childToParentMap[normalizedCategory],
            normalizedCategory,
            navMenuItems,
        );
    }

    return '';
};
