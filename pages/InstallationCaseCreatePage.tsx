import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { Container } from '../components/ui/Container';
import { RichHtmlEditor } from '../components/ui/RichHtmlEditor';
import { CaseStoryGuide } from '../components/content/CaseStoryGuide';
import { upsertCaseStory } from '../src/utils/caseStory';
import {
  addInstallationCase,
  getAllInstallationCases,
  getInstallationCaseCategories,
  getInstallationCaseCategoryEntries,
  getInstallationCaseCategoryNames,
  InstallationCase,
  InstallationCaseCategory,
  ContentCategoryEntry,
  normalizeContentCategoryName,
} from '../src/api/contentApi';
import { uploadImage } from '../src/api/storageApi';
import { useAuth } from '../src/context/AuthContext';

const DEFAULT_CATEGORY = '일반';

const getNextDisplayOrder = (items: InstallationCase[]) =>
  items.reduce((maxOrder, item) => Math.max(maxOrder, item.display_order || 0), 0) + 1;

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const InstallationCaseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { loading: authLoading, isAdmin } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const [nextDisplayOrder, setNextDisplayOrder] = React.useState(1);

  const [categories, setCategories] = React.useState<InstallationCaseCategory[]>([]);
  const [categoryEntries, setCategoryEntries] = React.useState<ContentCategoryEntry[]>([]);

  const [formData, setFormData] = React.useState({
    title: '',
    summary: '',
    category: DEFAULT_CATEGORY,
    image_url: '',
    content: '',
  });

  const coverFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        const [categoryData, entryData, allItems] = await Promise.all([
          getInstallationCaseCategories().catch((error) => {
            console.error('Failed to load installation case categories:', error);
            return [];
          }),
          getInstallationCaseCategoryEntries().catch((error) => {
            console.error('Failed to load installation case category entries:', error);
            return [];
          }),
          getAllInstallationCases().catch((error) => {
            console.error('Failed to load installation cases:', error);
            return [];
          }),
        ]);

        setCategories(categoryData);
        setCategoryEntries(entryData);
        setNextDisplayOrder(getNextDisplayOrder(allItems));
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      void initialize();
    }
  }, [isAdmin]);

  const categoryOptions = React.useMemo(() => {
    const names = getInstallationCaseCategoryNames(categories, categoryEntries);
    return names.length > 0 ? names : [DEFAULT_CATEGORY];
  }, [categories, categoryEntries]);

  React.useEffect(() => {
    setFormData((prev) => {
      if (categoryOptions.includes(prev.category)) return prev;
      return { ...prev, category: categoryOptions[0] || DEFAULT_CATEGORY };
    });
  }, [categoryOptions]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#39B54A]" size={36} />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setUploadingCover(true);
    try {
      const imageUrl = await uploadImage(file, 'installation-cases');
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error('Cover image upload failed:', error);
      alert('대표 이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = formData.title.trim();
    const category = normalizeContentCategoryName(formData.category) || DEFAULT_CATEGORY;
    const summary = formData.summary.trim() || stripHtml(formData.content).slice(0, 140);

    if (!title) {
      alert('제목을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const id = await addInstallationCase({
        category,
        title,
        summary,
        content: formData.content,
        image_url: formData.image_url,
        display_order: nextDisplayOrder,
        is_active: true,
        published_at: new Date().toISOString(),
      });

      navigate(`/cases/${id}`);
    } catch (error) {
      console.error('Failed to create installation case:', error);
      alert('사례등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="설치사례 등록 | 행사어때" description="설치사례 신규 게시글을 등록합니다." canonical="/cases/new" />

      <div className="bg-white min-h-screen pb-20">
        <Container>
          <div className="py-10 md:py-12">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">설치사례 등록</h1>
              <Link
                to="/cases"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
                목록으로
              </Link>
            </div>

            {loading ? (
              <div className="flex min-h-[30vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#39B54A]" size={32} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 ml-1 block text-sm font-bold text-slate-700">제목</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition-all focus:border-[#39B54A] focus:ring-4 focus:ring-[#39B54A]/10"
                      placeholder="설치사례 제목"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 ml-1 block text-sm font-bold text-slate-700">카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition-all focus:border-[#39B54A] focus:ring-4 focus:ring-[#39B54A]/10"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-sm font-bold text-slate-700">대표 이미지</label>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />

                  {formData.image_url ? (
                    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <img src={formData.image_url} alt="대표 이미지" className="h-52 w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                        className="absolute right-6 top-6 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-[#39B54A] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingCover ? (
                        <Loader2 className="animate-spin text-[#39B54A]" size={22} />
                      ) : (
                        <>
                          <Upload size={22} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-500">이미지 업로드</span>
                        </>
                      )}
                    </button>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    본문 이미지에 마우스를 올리면 대표이미지 선택 버튼이 표시됩니다.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-bold text-slate-700">본문</label>
                  <CaseStoryGuide initialContent={formData.content} onApply={(html, summary) => setFormData(prev => ({ ...prev, content: upsertCaseStory(prev.content, html), summary: prev.summary || summary }))} />
                  <label htmlFor="case-summary" className="mb-2 block text-sm font-bold text-slate-700">목록에 표시할 한 줄 요약</label>
                  <input id="case-summary" maxLength={140} value={formData.summary} onChange={event => setFormData(prev => ({ ...prev, summary: event.target.value }))}
                    placeholder="행사 규모와 맡은 업무를 한 문장으로 정리해주세요."
                    className="mb-4 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm" />
                  <RichHtmlEditor
                    initialValue={formData.content}
                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                    imageFolder="installation-cases"
                    placeholder="본문을 작성하고 이미지를 드래그해서 업로드하세요."
                    featuredImageUrl={formData.image_url}
                    onFeaturedImageSelect={(imageUrl) => setFormData((prev) => ({ ...prev, image_url: imageUrl }))}
                    enableFeaturedImageSelect
                    minHeightClassName="min-h-[420px]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    to="/cases"
                    className="flex-1 rounded-lg border border-slate-200 px-6 py-4 text-center font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    취소
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-[1.5] rounded-lg bg-[#39B54A] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#2F9A3F] disabled:bg-slate-300"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        저장 중...
                      </span>
                    ) : (
                      '사례등록'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Container>
      </div>
    </>
  );
};
