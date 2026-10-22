import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from './ui/Container';
import { ProductItem } from '../types';
import { getResponsiveImageProps } from '../src/utils/responsiveImage';
import { ALL_PRODUCTS_CATEGORY, buildProductListPath } from '../src/utils/productCategoryRoutes';

interface ProductSectionProps {
  title: string;
  categories: string[];
  products: ProductItem[];
  variant?: 'gray' | 'white';
  layoutMode?: string;
  sectionId?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  categories,
  products,
  variant = 'white',
  layoutMode = 'grid-4',
  sectionId,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  useEffect(() => {
    if (categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  const filteredProducts =
    activeCategory === ALL_PRODUCTS_CATEGORY
      ? products
      : products.filter((product) => product.category === activeCategory);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) {
      return;
    }

    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  let cardWidthClass = 'w-[180px] md:w-[280px]';
  let aspectRatioClass = 'aspect-[4/5]';

  switch (layoutMode) {
    case 'grid-5':
      cardWidthClass = 'w-[140px] md:w-[calc(20%-0.8rem)]';
      aspectRatioClass = 'aspect-[3/5]';
      break;
    case 'grid-3':
      cardWidthClass = 'w-[220px] md:w-[calc(33.333%-0.666rem)]';
      aspectRatioClass = 'aspect-[3/4]';
      break;
    case 'grid-2':
      cardWidthClass = 'w-[300px] md:w-[calc(50%-0.5rem)]';
      aspectRatioClass = 'aspect-[16/10]';
      break;
    case 'grid-4':
    default:
      cardWidthClass = 'w-[180px] md:w-[calc(25%-0.75rem)]';
      aspectRatioClass = 'aspect-[4/5]';
      break;
  }

  const productCardSizes = (() => {
    switch (layoutMode) {
      case 'grid-5':
        return '(max-width: 768px) 140px, 20vw';
      case 'grid-3':
        return '(max-width: 768px) 220px, 33vw';
      case 'grid-2':
        return '(max-width: 768px) 300px, 48vw';
      case 'grid-4':
      default:
        return '(max-width: 768px) 180px, 25vw';
    }
  })();

  const viewAllHref = buildProductListPath({
    sectionId,
    category: activeCategory !== ALL_PRODUCTS_CATEGORY ? activeCategory : undefined,
    title,
  });

  return (
    <div className={`py-12 md:py-20 ${variant === 'gray' ? 'bg-slate-50' : 'bg-white'}`}>
      <Container>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-[24px] font-semibold tracking-tight text-slate-900 md:text-[28px]">{title}</h2>
          </div>
          <Link
            to={viewAllHref}
            className="hidden text-sm font-semibold text-slate-400 transition-colors hover:text-[#39B54A] md:block"
          >
            전체보기
          </Link>
        </div>

        <div className="mb-5 flex gap-3 overflow-x-auto whitespace-nowrap px-1 no-scrollbar md:gap-4">
          {categories.map((category, index) => (
            <button
              key={`${category}-${index}`}
              onClick={() => setActiveCategory(category)}
              className={`h-[40px] min-w-[100px] flex-shrink-0 rounded-lg border px-4 text-center text-[14px] font-semibold shadow-sm transition-all hover:shadow md:text-[15px] ${
                activeCategory === category
                  ? 'border-[#39B54A] bg-[#39B54A] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#39B54A] hover:text-[#39B54A]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="group relative">
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-[calc(50%-48px)] z-10 h-14 w-14 -translate-y-1/2 rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-xl backdrop-blur-sm transition-all hover:scale-105 hover:border-slate-400 hover:bg-white hover:text-[#39B54A] group-hover:opacity-100 disabled:opacity-0 md:-left-6"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-[calc(50%-48px)] z-10 h-14 w-14 -translate-y-1/2 rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-xl backdrop-blur-sm transition-all hover:scale-105 hover:border-slate-400 hover:bg-white hover:text-[#39B54A] group-hover:opacity-100 md:-right-6"
          >
            <ChevronRight size={28} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredProducts.map((product) => {
              const imageProps = getResponsiveImageProps(product.imageUrl, {
                widths: [320, 480, 640, 960],
                sizes: productCardSizes,
                quality: 82,
                resize: 'cover',
              });

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className={`group/card block flex-none cursor-pointer ${cardWidthClass}`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className={`relative mb-4 overflow-hidden rounded-lg border border-slate-100 bg-slate-100 shadow-sm ${aspectRatioClass}`}>
                    <img
                      {...imageProps}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-900/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 md:p-5">
                      <span className="w-full translate-y-4 rounded-lg bg-white px-5 py-2 text-center text-xs font-bold text-slate-900 shadow-xl transition-transform duration-500 group-hover/card:translate-y-0">
                        상품보기
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="truncate text-[16px] font-bold text-slate-800 transition-colors group-hover/card:text-[#39B54A]">
                      {product.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-2">
                      {product.discountRate ? (
                        <span className="text-[18px] font-bold text-[#39B54A]">{product.discountRate}%</span>
                      ) : null}
                      <span className="text-[18px] font-medium text-slate-900">
                        {product.price?.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
};
