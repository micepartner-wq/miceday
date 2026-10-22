import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, Search, ChevronRight } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Seo } from '../components/seo/Seo';
import { getBasicProducts, getBasicProductsByCategories, Product } from '../src/api/productApi';
import { getProductsBySection } from '../src/api/sectionApi';
import { usePublicContent } from '../src/context/PublicContentContext';
import { getResponsiveImageProps } from '../src/utils/responsiveImage';
import {
    ALL_PRODUCTS_CATEGORY,
    buildChildCategoryPath,
    buildParentCategoryPath,
    buildProductListPath,
    resolvePrettyCategoryPath,
    resolveCategoryNameFromSlug,
} from '../src/utils/productCategoryRoutes';
import { NOINDEX_ROBOTS, absoluteUrl } from '../src/seo';

const CATEGORY_VARIANT_MAP: Record<string, string[]> = {
    사무실: ['오피스', '업무공간', '사무 공간'],
    오피스: ['사무실', '업무공간', '사무 공간'],
    시험장: ['시험장소', '시험 공간'],
    면접장: ['면접실', '인터뷰룸', 'interview-room'],
    '전시/박람회': ['전시', '박람회', '전시박람회'],
    '학회/컨퍼런스': ['학회', '컨퍼런스', '학회컨퍼런스'],
    '공연/축제': ['공연', '축제', '공연축제'],
    '관공서/행정': ['관공서', '행정', '관공서행정'],
    'IT/해커톤': ['IT', '해커톤', 'IT해커톤'],
    '채용/교육': ['채용', '교육', '채용교육'],
};

const toUnique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const expandCategoryVariants = (categories: string[]) =>
    toUnique(
        categories.flatMap((category) => {
            const variants = CATEGORY_VARIANT_MAP[category] || [];
            return [category, ...variants];
        }),
    );

const resolveCategoryCollection = (
    selectedCategory: string | null,
    parentToChildMap: Record<string, string[]>,
    childToParentMap: Record<string, string>,
) => {
    const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

    if (!selectedCategory) {
        return [];
    }

    if (parentToChildMap[selectedCategory]) {
        return unique([selectedCategory, ...parentToChildMap[selectedCategory]]);
    }

    if (childToParentMap[selectedCategory]) {
        const parent = childToParentMap[selectedCategory];
        return unique([selectedCategory, parent]);
    }

    if (selectedCategory.includes(',')) {
        return unique(selectedCategory.split(',').map((value) => value.trim()).filter(Boolean));
    }

    return unique([selectedCategory]);
};

export const ProductListPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { groupSlug, categorySlug } = useParams();
    const [searchParams] = useSearchParams();
    const { loading: loadingPublicContent, navMenuItems } = usePublicContent();

    const sectionId = searchParams.get('sectionId');
    const urlTitle = searchParams.get('title');
    const legacyCategory = searchParams.get('category');
    const categoryNames = useMemo(() => {
        const names = new Set<string>();
        navMenuItems.forEach((item) => {
            if (item.name) {
                names.add(item.name);
            }
            if (item.category) {
                names.add(item.category);
            }
        });
        return Array.from(names);
    }, [navMenuItems]);
    const routeGroup = resolveCategoryNameFromSlug(groupSlug, navMenuItems, categoryNames);
    const routeCategory = resolveCategoryNameFromSlug(
        categorySlug,
        navMenuItems,
        categoryNames,
        routeGroup || undefined,
    );
    const selectedCategory = routeCategory || routeGroup || legacyCategory;

    useEffect(() => {
        if (!location.pathname.startsWith('/services/')) {
            return;
        }

        navigate(location.pathname.replace('/services/', '/service/'), { replace: true });
    }, [location.pathname, navigate]);

    const [activeCategory, setActiveCategory] = useState(ALL_PRODUCTS_CATEGORY);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayedCategories, setDisplayedCategories] = useState<string[]>([ALL_PRODUCTS_CATEGORY]);
    const [parentToChildMap, setParentToChildMap] = useState<Record<string, string[]>>({});
    const [currentGroup, setCurrentGroup] = useState<string | null>(null);

    useEffect(() => {
        if (loadingPublicContent || !legacyCategory || sectionId || routeGroup) {
            return;
        }

        const nextParentToChildMap: Record<string, string[]> = {};
        const nextChildToParentMap: Record<string, string> = {};

        navMenuItems.forEach((item) => {
            if (!item.category || !item.name) {
                return;
            }

            if (!nextParentToChildMap[item.category]) {
                nextParentToChildMap[item.category] = [];
            }

            nextParentToChildMap[item.category].push(item.name);
            nextChildToParentMap[item.name] = item.category;
        });

        const prettyPath = resolvePrettyCategoryPath(
            legacyCategory,
            nextParentToChildMap,
            nextChildToParentMap,
            navMenuItems,
        );

        if (prettyPath) {
            navigate(prettyPath, { replace: true });
        }
    }, [legacyCategory, loadingPublicContent, navigate, navMenuItems, routeGroup, sectionId]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (loadingPublicContent) {
                return;
            }

            setLoading(true);

            try {
                const nextParentToChildMap: Record<string, string[]> = {};
                const nextChildToParentMap: Record<string, string> = {};

                navMenuItems.forEach((item) => {
                    if (!item.category || !item.name) {
                        return;
                    }

                    if (!nextParentToChildMap[item.category]) {
                        nextParentToChildMap[item.category] = [];
                    }

                    nextParentToChildMap[item.category].push(item.name);
                    nextChildToParentMap[item.name] = item.category;
                });

                setParentToChildMap(nextParentToChildMap);

                const resolvedCategories = resolveCategoryCollection(
                    selectedCategory,
                    nextParentToChildMap,
                    nextChildToParentMap,
                );
                const fetchCategories = expandCategoryVariants(resolvedCategories);

                let productData = sectionId
                    ? await getProductsBySection(sectionId)
                    : fetchCategories.length > 0
                        ? await getBasicProductsByCategories(fetchCategories)
                        : await getBasicProducts();

                // Fallback: if child route has no products, widen to full parent group once.
                if (!sectionId && productData.length === 0 && selectedCategory) {
                    const parentForFallback =
                        nextParentToChildMap[selectedCategory]
                            ? selectedCategory
                            : nextChildToParentMap[selectedCategory];

                    if (parentForFallback && nextParentToChildMap[parentForFallback]) {
                        const fallbackCategories = expandCategoryVariants([
                            parentForFallback,
                            ...nextParentToChildMap[parentForFallback],
                        ]);
                        productData = await getBasicProductsByCategories(
                            Array.from(new Set(fallbackCategories)),
                        );
                    }
                }

                setProducts(productData);

                const uniqueCategories = [
                    ALL_PRODUCTS_CATEGORY,
                    ...new Set(productData.map((product) => product.category).filter(Boolean) as string[]),
                ];

                let nextGroup: string | null = null;
                let nextActiveCategory = ALL_PRODUCTS_CATEGORY;
                let nextDisplayedCategories = uniqueCategories;

                if (routeCategory && routeGroup) {
                    nextGroup = routeGroup;
                    nextActiveCategory = routeCategory;
                    nextDisplayedCategories = [ALL_PRODUCTS_CATEGORY, ...(nextParentToChildMap[routeGroup] || [])];
                } else if (routeGroup && nextParentToChildMap[routeGroup]) {
                    nextGroup = routeGroup;
                    nextDisplayedCategories = [ALL_PRODUCTS_CATEGORY, ...nextParentToChildMap[routeGroup]];
                } else if (selectedCategory) {
                    if (nextParentToChildMap[selectedCategory]) {
                        nextGroup = selectedCategory;
                        nextDisplayedCategories = [ALL_PRODUCTS_CATEGORY, ...nextParentToChildMap[selectedCategory]];
                    } else if (nextChildToParentMap[selectedCategory]) {
                        nextGroup = nextChildToParentMap[selectedCategory];
                        nextActiveCategory = selectedCategory;
                        nextDisplayedCategories = [
                            ALL_PRODUCTS_CATEGORY,
                            ...(nextParentToChildMap[nextGroup] || []),
                        ];
                    } else {
                        nextActiveCategory = selectedCategory;
                        if (selectedCategory.includes(',')) {
                            nextDisplayedCategories = [ALL_PRODUCTS_CATEGORY, ...selectedCategory.split(',')];
                        }
                    }
                }

                setCurrentGroup(nextGroup);
                setActiveCategory(nextActiveCategory);
                setDisplayedCategories(nextDisplayedCategories);
            } catch (error) {
                console.error('Error getting products:', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchProducts();
    }, [loadingPublicContent, navMenuItems, routeCategory, routeGroup, sectionId, selectedCategory]);

    const filteredProducts = useMemo(
        () =>
            products.filter((product) => {
                const productCategory = product.category || '';

                if (activeCategory === ALL_PRODUCTS_CATEGORY) {
                    if (currentGroup && parentToChildMap[currentGroup]) {
                        return [currentGroup, ...parentToChildMap[currentGroup]].includes(productCategory);
                    }

                    return true;
                }

                if (productCategory === activeCategory) {
                    return true;
                }

                if (activeCategory.includes(',')) {
                    return activeCategory.split(',').includes(productCategory);
                }

                return false;
            }),
        [activeCategory, currentGroup, parentToChildMap, products],
    );

    const pageTitle =
        currentGroup || urlTitle || (activeCategory !== ALL_PRODUCTS_CATEGORY ? activeCategory : '전체 상품');
    const isSectionLandingPage = Boolean(sectionId);
    const canonicalPath = routeCategory && routeGroup
        ? buildChildCategoryPath(routeGroup, routeCategory, navMenuItems)
        : routeGroup
            ? buildParentCategoryPath(routeGroup, navMenuItems)
            : selectedCategory
                ? buildProductListPath({ category: selectedCategory, title: pageTitle, sectionId })
                : '/products';
    const pageDescription =
        currentGroup || activeCategory !== ALL_PRODUCTS_CATEGORY
            ? `행사어때에서 ${pageTitle} 관련 행사 상품과 서비스를 확인해보세요. 필요한 장비와 구성을 한 곳에서 비교할 수 있습니다.`
            : '행사어때의 전체 상품 목록입니다. 다양한 행사 운영 장비와 서비스를 한 곳에서 비교할 수 있습니다.';

    const getCategoryLink = (category: string) => {
        if (category === ALL_PRODUCTS_CATEGORY) {
            if (currentGroup) {
                return buildParentCategoryPath(currentGroup, navMenuItems);
            }

            return buildProductListPath({
                sectionId,
                title: urlTitle,
            });
        }

        if (currentGroup) {
            return buildChildCategoryPath(currentGroup, category, navMenuItems);
        }

        return buildProductListPath({
            category,
            title: urlTitle || category,
            sectionId,
        });
    };

    const categorySchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${pageTitle} | 행사어때`,
        description: pageDescription,
        url: absoluteUrl(canonicalPath),
    };

    return (
        <div className="bg-white pb-16 pt-12 md:pb-24 md:pt-16">
            <Seo
                title={`${pageTitle} | 행사어때`}
                description={pageDescription}
                canonical={canonicalPath}
                robots={isSectionLandingPage ? NOINDEX_ROBOTS : undefined}
                jsonLd={categorySchema}
            />

            <Container>
                {/* Breadcrumbs */}
                {pageTitle !== '전체 상품' && !isSectionLandingPage && (
                    <nav className="mb-4 md:mb-6">
                        <ol className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                            <li>
                                <Link to="/" className="hover:text-[#39B54A] transition-colors whitespace-nowrap">
                                    홈
                                </Link>
                            </li>
                            <li>
                                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                            </li>
                            <li>
                                <Link to="/products" className="hover:text-[#39B54A] transition-colors whitespace-nowrap">
                                    전체보기
                                </Link>
                            </li>
                            {currentGroup && currentGroup !== '전체 상품' && (
                                <>
                                    <li>
                                        <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                                    </li>
                                    <li className="font-semibold text-gray-900 truncate">
                                        {currentGroup}
                                    </li>
                                </>
                            )}
                        </ol>
                    </nav>
                )}

                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:mb-8">
                    <h1 className="text-[24px] font-bold tracking-[-0.02em] text-slate-900 md:text-3xl">
                        {pageTitle}
                    </h1>
                    <div className="relative w-full md:max-w-[300px]">
                        <input
                            type="text"
                            placeholder="장비, 서비스를 검색해보세요"
                            className="w-full h-11 pl-4 pr-11 rounded-full border border-gray-200 bg-gray-50 text-[14px] transition-all focus:border-[#39B54A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#39B54A]"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                    window.location.href = `/search?q=${encodeURIComponent(e.currentTarget.value)}`;
                                }
                            }}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="scrollbar-hide -mx-1 mb-8 overflow-x-auto px-1 md:mb-10 md:overflow-visible">
                    <div className="inline-flex min-w-full gap-3 md:flex md:min-w-0 md:flex-wrap md:gap-4">
                        {displayedCategories.map((category, index) => {
                            const isActive = activeCategory === category;

                            return (
                                <Link
                                    key={`${category}-${index}`}
                                    to={getCategoryLink(category)}
                                    className={`h-[40px] min-w-[96px] shrink-0 rounded-xl border px-4 text-center text-[14px] font-semibold leading-[40px] transition-all md:text-[15px] ${
                                        isActive
                                            ? 'border-[#39B54A] bg-[#39B54A] text-white shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-[#39B54A] hover:text-[#39B54A]'
                                    }`}
                                >
                                    {category}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#39B54A]" size={40} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        등록된 상품이 없습니다.{' '}
                        <Link to="/admin/products" className="text-[#39B54A] underline">
                            관리자에서 상품 추가
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-8 2xl:grid-cols-3">
                        {filteredProducts.map((product) => {
                            const imageProps = getResponsiveImageProps(
                                product.image_url || 'https://picsum.photos/seed/product/400/500',
                                {
                                    widths: [480, 640, 960, 1280],
                                    sizes: '(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw',
                                    quality: 82,
                                    resize: 'cover',
                                },
                            );

                            return (
                                <Link to={`/products/${product.id}`} key={product.id} className="group cursor-pointer">
                                    <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                                        <img
                                            {...imageProps}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                                        {product.stock === 0 ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <span className="font-bold text-white">품절</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="space-y-1.5 px-1">
                                        <h3 className="line-clamp-2 text-[16px] font-bold leading-tight text-slate-800 transition-colors group-hover:text-[#39B54A]">
                                            {product.name}
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            {product.discount_rate && product.discount_rate > 0 ? (
                                                <span className="text-[18px] font-bold text-[#39B54A]">
                                                    {product.discount_rate}%
                                                </span>
                                            ) : null}
                                            <span className="text-[18px] font-medium text-slate-900">
                                                {product.price?.toLocaleString()}원
                                            </span>
                                        </div>

                                        {product.stock !== undefined && product.stock > 0 && product.stock <= 3 ? (
                                            <span className="text-xs text-orange-500">재고 {product.stock}개 남음</span>
                                        ) : null}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </Container>
        </div>
    );
};
