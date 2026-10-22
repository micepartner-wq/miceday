import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Calendar, Loader2, CheckCircle, XCircle, AlertCircle, FileText, Download, Receipt, ChevronRight, BarChart, FileQuestion, Users, MapPin, DollarSign, MessageCircle } from 'lucide-react';
import { getMyInquiries, Inquiry } from '../src/api/inquiryApi';
import { useAuth } from '../src/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { NOINDEX_ROBOTS } from '../src/seo';

export const MyPage: React.FC = () => {
    const { user, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const inquiriesData = await getMyInquiries(user.uid);
                // category가 'quote'인 것만 필터링
                const quotesData = inquiriesData.filter(q => q.category === 'quote');
                setQuotes(quotesData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotes();
    }, [user]);

    const getStatusBadge = (status?: string) => {
        const isAnswered = status === 'answered';
        return isAnswered ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm bg-[#39B54A]/10 border border-[#39B54A]/30 text-[#39B54A]">
                <CheckCircle size={14} strokeWidth={2.5} />
                견적 완료
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm bg-orange-100 border border-orange-300 text-orange-800">
                <FileQuestion size={14} strokeWidth={2.5} />
                견적 진행 중
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const parseQuoteContent = (content: string) => {
        const lines = content.split('\n');
        const result: any = {
            package: '맞춤형 프로젝트',
            date: '미정',
            location: '미정',
            pax: '미정',
            budget: '미정',
            services: [],
            files: []
        };

        lines.forEach(line => {
            if (line.startsWith('■ 선택한 패키지:')) result.package = line.replace('■ 선택한 패키지:', '').trim();
            if (line.startsWith('■ 행사 예정일:')) result.date = line.replace('■ 행사 예정일:', '').trim();
            if (line.startsWith('■ 행사 장소:')) result.location = line.replace('■ 행사 장소:', '').trim();
            if (line.startsWith('■ 예상 규모:')) result.pax = line.replace('■ 예상 규모:', '').trim();
            if (line.startsWith('■ 예산 범위:')) result.budget = line.replace('■ 예산 범위:', '').trim();
            if (line.includes('[다운로드]')) {
                result.files.push(line.trim());
            }
        });

        const servicesMatch = content.match(/===SERVICES_START===\n([\s\S]*?)\n===SERVICES_END===/);
        if (servicesMatch && servicesMatch[1]) {
            result.services = servicesMatch[1].split('||').map(s => s.trim()).filter(Boolean);
        }

        const SERVICES_MAP: Record<string, string> = {
            'stage': '무대 및 A/V 시스템',
            'booth': '공간 연출 및 부스',
            'power': 'IT 장비 및 전력망 구축',
            'catering': 'F&B 케이터링',
            'staff': '현장 운영 및 매니지먼트',
            'design': '홍보 및 디자인 인쇄물'
        };

        result.services = result.services.map((s: string) => SERVICES_MAP[s] || s);

        return result;
    };

    if (!user) {
        return (
            <>
                <Seo
                    title="내 견적 및 프로젝트 | 행사어때"
                    description="행사어때 기업 회원 전용 프로젝트 현황 페이지입니다."
                    canonical="/mypage"
                    robots={NOINDEX_ROBOTS}
                />
                <div className="py-20 text-center">
                    <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
                    <Link to="/login" className="text-[#39B54A] underline">로그인하기</Link>
                </div>
            </>
        );
    }

    const statusCounts = {
        total: quotes.length,
        pending: quotes.filter(q => q.status !== 'answered').length,
        confirmed: quotes.filter(q => q.status === 'answered').length,
    };

    return (
        <div className="py-12 bg-gray-50 min-h-screen">
            <Seo
                title="내 견적 및 프로젝트 | 행사어때"
                description="행사어때 기업 회원 전용 프로젝트 현황 페이지입니다."
                canonical="/mypage"
                robots={NOINDEX_ROBOTS}
            />
            <Container>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / User Profile Summary */}
                    <div className="md:w-1/4">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center sticky top-24">
                            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-white border border-gray-100 shadow-sm">
                                <img
                                    src="/Symbol.png"
                                    alt="행사어때 심볼"
                                    className="w-16 h-16 object-contain"
                                    decoding="async"
                                />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">{userProfile?.name || '고객'} 님</h2>
                            <p className="text-sm font-bold text-[#39B54A] mb-1">{userProfile?.company_name || '기업 회원'}</p>
                            <p className="text-xs text-gray-400 mb-6">{userProfile?.email || user.email}</p>
                            <div className="text-left space-y-1 border-t border-gray-100 pt-4">
                                <Link to="/mypage" className="text-sm font-bold text-[#39B54A] block w-full text-left py-2 px-2 rounded hover:bg-[#39B54A]/5">
                                    내 견적 및 프로젝트
                                </Link>
                                <Link to="/mypage/info" className="text-sm text-gray-500 block w-full text-left py-2 px-2 rounded hover:bg-gray-50 hover:text-black transition-colors">
                                    내 정보 관리
                                </Link>
                                <Link to="/mypage/inquiry" className="text-sm text-gray-500 block w-full text-left py-2 px-2 rounded hover:bg-gray-50 hover:text-black transition-colors">
                                    1:1 문의 내역
                                </Link>
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button 
                                        onClick={async () => {
                                            await logout();
                                            navigate('/');
                                        }} 
                                        className="text-sm text-red-500 block w-full text-left py-2 px-2 rounded hover:bg-red-50 transition-colors"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content / Quote List */}
                    <div className="md:w-3/4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart size={28} className="text-[#39B54A]" /> 프로젝트 견적 현황
                        </h1>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-[#39B54A]" size={40} />
                            </div>
                        ) : quotes.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">진행 중인 견적 요청이 없습니다.</h3>
                                <p className="text-gray-500 mb-6">스마트 견적을 통해 맞춤형 렌탈/행사 프로젝트를 시작해보세요.</p>
                                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-[#39B54A] text-white font-bold rounded-lg hover:bg-[#2F9A3F] transition-colors shadow-sm">
                                    스마트 견적 의뢰하기
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Status Dashboard */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-gray-300 transition-colors">
                                        <span className="text-gray-500 text-sm font-medium mb-2">전체 의뢰</span>
                                        <span className="text-3xl font-black text-gray-900">{statusCounts.total}<span className="text-base font-medium text-gray-400 ml-1">건</span></span>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-yellow-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-yellow-300 transition-colors">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                                        <span className="text-yellow-600 text-sm font-bold mb-2 flex items-center gap-1"><FileQuestion size={16}/> 견적 진행 중</span>
                                        <span className="text-3xl font-black text-yellow-600">{statusCounts.pending}<span className="text-base font-medium text-yellow-400 ml-1">건</span></span>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-[#39B54A]/20 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-[#39B54A]/40 transition-colors">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-[#39B54A]"></div>
                                        <span className="text-[#39B54A] text-sm font-bold mb-2 flex items-center gap-1"><CheckCircle size={16}/> 견적 완료</span>
                                        <span className="text-3xl font-black text-[#39B54A]">{statusCounts.confirmed}<span className="text-base font-medium text-[#39B54A]/50 ml-1">건</span></span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {quotes.map((quote) => {
                                        const parsed = parseQuoteContent(quote.content);
                                        return (
                                        <div key={quote.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
                                            {/* Mobile/Tablet Layout (Visible on screens < lg) */}
                                            <div 
                                                className="lg:hidden cursor-pointer active:bg-gray-50 transition-colors"
                                                onClick={() => {
                                                    const el = document.getElementById(`details-${quote.id}`);
                                                    if (el) el.classList.toggle('hidden');
                                                }}
                                            >
                                                <div className="p-5 border-b border-gray-50">
                                                    <div className="flex justify-between items-start mb-3">
                                                        {getStatusBadge(quote.status)}
                                                        <span className="text-xs text-gray-400 font-medium tracking-tight">{formatDate(quote.created_at || new Date().toISOString())}</span>
                                                    </div>
                                                    <div className="mb-4">
                                                        <h3 className="font-extrabold text-lg text-gray-900 leading-tight mb-2">
                                                            {parsed.package}
                                                        </h3>
                                                        <div className="text-xs text-gray-500 space-y-1">
                                                            <div className="flex items-center gap-1.5"><Calendar size={12} className="text-[#39B54A]" /> {parsed.date}</div>
                                                            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#39B54A]" /> {parsed.location}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const el = document.getElementById(`details-${quote.id}`);
                                                                if (el) el.classList.toggle('hidden');
                                                            }}
                                                            className="flex-1 py-2.5 bg-[#39B54A]/10 text-[#39B54A] rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1"
                                                        >
                                                            의뢰 명세서 보기 <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop Layout (Visible on screens >= lg) */}
                                            <div 
                                                className="hidden lg:flex p-6 flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                            >
                                                <div className="flex gap-6 items-start flex-grow cursor-pointer"
                                                     onClick={() => {
                                                        const el = document.getElementById(`details-${quote.id}`);
                                                        if (el) el.classList.toggle('hidden');
                                                     }}>
                                                    {/* Center: Info */}
                                                    <div className="min-w-0 flex flex-col gap-2 w-full">
                                                        <div className="flex items-center gap-3">
                                                            {getStatusBadge(quote.status)}
                                                            <span className="text-xs text-gray-400 font-medium tracking-tight">의뢰일: {formatDate(quote.created_at || new Date().toISOString())}</span>
                                                        </div>
                                                        <h3 className="font-extrabold text-2xl text-gray-900 leading-tight tracking-tight hover:text-[#39B54A] transition-colors mt-1">
                                                            {parsed.package}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <div className="text-sm text-gray-600 flex items-center gap-2 font-medium bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                                                <Calendar size={14} className="text-[#39B54A]" />
                                                                <span>{parsed.date}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 flex items-center gap-2 font-medium bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                                                <MapPin size={14} className="text-[#39B54A]" />
                                                                <span>{parsed.location}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 flex items-center gap-2 font-medium bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                                                <Users size={14} className="text-[#39B54A]" />
                                                                <span>{parsed.pax}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex flex-col items-end gap-2.5 flex-shrink-0 w-48">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const el = document.getElementById(`details-${quote.id}`);
                                                            if (el) el.classList.toggle('hidden');
                                                        }}
                                                        className="w-full py-2.5 bg-[#39B54A]/10 text-[#39B54A] rounded-lg text-sm font-bold hover:bg-[#39B54A]/20 transition-all flex items-center justify-center gap-1"
                                                    >
                                                        의뢰 명세서 보기 <ChevronRight size={16} />
                                                    </button>
                                                    {quote.status !== 'answered' && (
                                                        <button 
                                                            className="w-full py-2.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-bold hover:bg-yellow-100 transition-all shadow-sm flex items-center justify-center gap-2"
                                                            onClick={(e) => { e.stopPropagation(); alert('견적서 산출 중입니다. 영업일 기준 24시간 내에 회신해 드립니다.'); }}
                                                        >
                                                            <Loader2 size={16} className="animate-spin" /> 견적 진행 중
                                                        </button>
                                                    )}
                                                    {quote.status === 'answered' && (
                                                        <>
                                                            <button 
                                                                className="w-full py-2.5 bg-[#39B54A] text-white rounded-lg text-sm font-bold hover:bg-[#2F9A3F] transition-all shadow-sm flex items-center justify-center gap-2"
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    window.open('http://pf.kakao.com/_iRxghX/chat', '_blank', 'noopener,noreferrer');
                                                                }}
                                                            >
                                                                견적 관련 추가 문의
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expandable Details Section - Invoice Style */}
                                            <div id={`details-${quote.id}`} className="hidden bg-white border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500 relative">
                                                <div className="p-5 md:p-8">
                                                    
                                                    {/* Manager Answer Section */}
                                                    {quote.status === 'answered' && quote.answer && (
                                                        <div className="mb-6 bg-slate-50 border border-[#39B54A]/20 rounded-xl p-6">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <CheckCircle className="text-[#39B54A] w-5 h-5" />
                                                                <h4 className="font-bold text-gray-900">담당 매니저 답변</h4>
                                                                <span className="text-xs text-gray-500 ml-2">{formatDate(quote.answered_at || '')}</span>
                                                            </div>
                                                            <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-gray-100">
                                                                {quote.answer}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-6 shadow-inner">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-4 gap-2">
                                                            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                                <FileText size={20} className="text-[#39B54A]" /> 의뢰 상세 내역
                                                            </h4>
                                                        </div>

                                                        {/* Info Grid */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                                                            <div className="bg-white p-3 rounded border border-gray-100">
                                                                <span className="block text-xs text-gray-400 mb-1">행사 예정일</span>
                                                                <span className="font-bold text-gray-800">{parsed.date}</span>
                                                            </div>
                                                            <div className="bg-white p-3 rounded border border-gray-100">
                                                                <span className="block text-xs text-gray-400 mb-1">행사 장소</span>
                                                                <span className="font-bold text-gray-800">{parsed.location}</span>
                                                            </div>
                                                            <div className="bg-white p-3 rounded border border-gray-100">
                                                                <span className="block text-xs text-gray-400 mb-1">예상 규모</span>
                                                                <span className="font-bold text-gray-800">{parsed.pax}</span>
                                                            </div>
                                                            <div className="bg-white p-3 rounded border border-gray-100">
                                                                <span className="block text-xs text-gray-400 mb-1">예산 범위</span>
                                                                <span className="font-bold text-gray-800">{parsed.budget}</span>
                                                            </div>
                                                        </div>

                                                        {/* Services Selection */}
                                                        {parsed.services.length > 0 && (
                                                            <div className="mb-6">
                                                                <h5 className="font-bold text-gray-700 text-sm mb-3">선택한 필요 서비스</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {parsed.services.map((svc: string, i: number) => (
                                                                        <span key={i} className="inline-block bg-[#39B54A]/10 text-[#39B54A] font-bold text-xs px-3 py-1.5 rounded-full border border-[#39B54A]/20">
                                                                            {svc}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Attached Files */}
                                                        {parsed.files.length > 0 && (
                                                            <div className="mt-6 border-t border-gray-200 pt-5">
                                                                <h5 className="font-bold text-gray-700 text-sm mb-3">첨부 파일</h5>
                                                                <div className="flex flex-col gap-2">
                                                                    {parsed.files.map((file: string, i: number) => {
                                                                        // "[다운로드] filename : url" parsing
                                                                        const parts = file.replace('[다운로드]', '').trim().split(' : ');
                                                                        const filename = parts[0];
                                                                        const url = parts.length > 1 ? parts[1] : '#';
                                                                        
                                                                        return (
                                                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#39B54A] transition-colors bg-white p-2.5 rounded border border-gray-200 w-fit pr-6">
                                                                                <Download size={14} className="text-gray-400" />
                                                                                <span className="font-medium">{filename}</span>
                                                                            </a>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Note Footer */}
                                                        <div className="mt-6 border-t border-gray-200 pt-5 flex items-center gap-2 text-sm text-gray-500">
                                                            <AlertCircle size={16} className="text-[#39B54A]" />
                                                            <span>견적서가 발행되면 이메일로도 알림을 보내드립니다.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};
