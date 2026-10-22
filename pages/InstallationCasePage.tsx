import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { Container } from '../components/ui/Container';
import {
  getInstallationCaseCategories,
  getInstallationCaseCategoryEntries,
  getInstallationCaseCategoryNames,
  getInstallationCasesPage,
  InstallationCase,
  InstallationCaseCategory,
  ContentCategoryEntry,
} from '../src/api/contentApi';
import { useAuth } from '../src/context/AuthContext';

import { LazyImage } from '../components/ui/LazyImage';

const PAGE_TITLE = '레퍼런스';
const ITEMS_PER_PAGE = 9;

const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(currentPage - 4, totalPages - 9));
  return Array.from({ length: 10 }, (_, index) => startPage + index);
};

export const InstallationCasePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState('전체');
  const [searchInput, setSearchInput] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [items, setItems] = React.useState<InstallationCase[]>([]);
  const [categories, setCategories] = React.useState<InstallationCaseCategory[]>([]);
  const [categoryEntries, setCategoryEntries] = React.useState<ContentCategoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [listLoading, setListLoading] = React.useState(true);
  const [totalItems, setTotalItems] = React.useState(0);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [categoryData, entryData] = await Promise.all([
          getInstallationCaseCategories().catch((error) => {
            console.error('Failed to load installation case categories:', error);
            return [];
          }),
          getInstallationCaseCategoryEntries().catch((error) => {
            console.error('Failed to load installation case category entries:', error);
            return [];
          }),
        ]);

        setCategories(categoryData);
        setCategoryEntries(entryData);
      } catch (error) {
        console.error('Failed to initialize installation case categories:', error);
        setCategories([]);
        setCategoryEntries([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchCategories();
  }, []);

  React.useEffect(() => {
    if (loading) return;

    const fetchItems = async () => {
      setListLoading(true);

      try {
        const { data, count } = await getInstallationCasesPage({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          category: selectedCategory === '전체' ? undefined : selectedCategory,
          searchTerm,
        });

        setItems(data);
        setTotalItems(count);
      } catch (error) {
        console.error('Failed to load installation cases:', error);
        setItems([]);
        setTotalItems(0);
      } finally {
        setListLoading(false);
      }
    };

    void fetchItems();
  }, [currentPage, loading, searchTerm, selectedCategory]);

  const categoryTabs = ['전체', ...getInstallationCaseCategoryNames(categories, categoryEntries)];

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  React.useEffect(() => {
    if (selectedCategory !== '전체' && !categoryTabs.includes(selectedCategory)) {
      setSelectedCategory('전체');
    }
  }, [categoryTabs, selectedCategory]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 260, behavior: 'smooth' });
  };

  const hasKeyword = searchTerm.trim().length > 0 || selectedCategory !== '전체';
  const emptyMessage = hasKeyword ? '검색 결과가 없습니다.' : '등록된 레퍼런스가 없습니다.';

  return (
    <>
      <Seo
        title="레퍼런스 | 행사어때"
        description="행사어때 레퍼런스를 확인할 수 있습니다."
        canonical="/cases"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: '레퍼런스 | 행사어때',
          description: '행사어때 레퍼런스를 확인할 수 있습니다.',
          url: 'https://miceday.co.kr/cases'
        }}
      />

      <div className="bg-white min-h-screen pb-20">
        <Container>
          <div className="py-10 md:py-16 text-left">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{PAGE_TITLE}</h2>
                <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed break-keep">
                  행사어때가 성공적으로 총괄 및 운영해 낸 현장 구축 포트폴리오입니다.
                </p>
              </div>

              {isAdmin ? (
                <Link
                  to="/cases/new"
                  className="inline-flex items-center gap-2 rounded-md bg-[#39B54A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2e933c]"
                >
                  <Plus size={16} />
                  사례등록
                </Link>
              ) : null}
            </div>
          </div>



          <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {categoryTabs.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  aria-pressed={selectedCategory === category}
                  className={`border-b-[3px] px-1 py-3 text-base font-semibold transition-colors md:text-[17px] ${
                    selectedCategory === category
                      ? 'border-[#39B54A] text-[#1f8f36]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading || listLoading ? (
            <div className="py-24 text-center mb-16">
              <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 mb-16">
              {items.map((item) => (
                <article key={item.id} className="group relative overflow-hidden bg-slate-900">
                  <Link to={`/cases/${item.id}`} className="block w-full h-full">
                    <div className="aspect-[16/10] w-full relative">
                        {item.image_url ? (
                          <LazyImage
                            src={item.image_url}
                            alt={item.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex h-full items-center justify-center bg-slate-800 text-sm text-gray-400">
                            이미지 준비중
                          </div>
                        )}
                        
                        {/* 어두운 오버레이 - 호버 시 빠르게 사라짐 */}
                        <div className="absolute inset-0 bg-black/50 transition-opacity duration-200 group-hover:opacity-0 z-10 pointer-events-none"></div>
                        
                        {/* 텍스트 영역 - 호버 시 빠르게 사라짐 */}
                        <div className="absolute inset-0 z-20 transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
                            {/* 좌측 상단 카테고리 */}
                            <div className="absolute top-4 left-4 md:top-5 md:left-5">
                                <span className="text-white/90 text-[12px] font-medium drop-shadow-md tracking-wide">
                                    {item.category ? `[${item.category}]` : ''}
                                </span>
                            </div>
                            
                            {/* 중앙 타이틀 */}
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                                <h3 className="text-white text-[15px] md:text-base font-normal text-center break-keep drop-shadow-md leading-relaxed tracking-wide">
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-b border-gray-200 mb-16">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <form
              className="flex w-full max-w-sm bg-white border border-gray-300 rounded-full overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-[#39B54A]/20 focus-within:border-[#39B54A]"
              onSubmit={(event) => {
                event.preventDefault();
                setCurrentPage(1);
                setSearchTerm(searchInput);
              }}
            >
              <input
                type="text"
                placeholder="레퍼런스 검색"
                className="flex-1 min-w-0 px-5 py-2.5 text-[14px] outline-none bg-transparent"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button
                type="submit"
                className="bg-slate-50 text-slate-600 px-6 py-2.5 text-[14px] font-medium hover:bg-slate-100 transition-colors shrink-0 border-l border-gray-200"
              >
                검색
              </button>
            </form>
          </div>

          {totalPages > 1 && items.length > 0 && (
            <div className="flex justify-center items-center gap-1.5 font-sans mb-10">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-sm"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-sm"
              >
                <ChevronLeft size={14} />
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center border text-[13px] transition-colors rounded-sm ${
                    currentPage === page
                      ? 'border-[#39B54A] bg-[#39B54A] text-white font-bold'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-sm"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-sm"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};
