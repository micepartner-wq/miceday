import React from 'react';
import { Container } from '../ui/Container';
import { Link, useLocation } from 'react-router-dom';

const ArrowUpIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
    </svg>
);



export function Footer() {
    const location = useLocation();
    const isProductDetailPage = /^\/products\/[^/]+$/.test(location.pathname);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#F8F9FA] border-t border-gray-200 pt-16 pb-24 md:pb-12 text-sm text-gray-600">
            <Container>
                {/* Main 4-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
                    
                    {/* Col 1: Brand & Social */}
                    <div className="lg:col-span-4 flex flex-col items-start">
                        <img src="/Miceday_Logo.png" alt="행사어때" className="h-[28px] object-contain mb-6" decoding="async" />
                        <p className="text-gray-500 text-[14px] leading-relaxed mb-6 font-medium">
                            담당자의 부담은 최소화하고,<br/>
                            행사의 품격은 극대화하는 완벽한 솔루션
                        </p>
                        <a href="https://blog.naver.com/human_0202" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 transition-all hover:scale-105" aria-label="네이버 블로그" title="네이버 블로그">
                            <img src="/naverblog_logo.png" alt="네이버 블로그" className="w-10 h-10 rounded-[12px] object-cover shadow-sm hover:shadow-md" decoding="async" />
                        </a>
                    </div>

                    {/* Col 2: Services */}
                    <div className="lg:col-span-2">
                        <h4 className="font-extrabold text-gray-900 mb-5 text-[15px]">서비스</h4>
                        <ul className="flex flex-col gap-3.5 text-[14px] font-medium text-gray-500">
                            <li><Link to="/" onClick={scrollToTop} className="hover:text-[#39B54A] transition-colors">홈</Link></li>
                            <li><a href="https://micepartner.co.kr/" target="_blank" rel="noopener noreferrer" className="hover:text-[#39B54A] transition-colors">회사소개</a></li>
                            <li><Link to="/alliance" onClick={scrollToTop} className="hover:text-[#39B54A] transition-colors">협력사</Link></li>
                            <li><Link to="/partner" onClick={scrollToTop} className="hover:text-[#39B54A] transition-colors">파트너 제휴 문의</Link></li>
                        </ul>
                    </div>

                    {/* Col 3: Support */}
                    <div className="lg:col-span-2">
                        <h4 className="font-extrabold text-gray-900 mb-5 text-[15px]">고객지원</h4>
                        <ul className="flex flex-col gap-3.5 text-[14px] font-medium text-gray-500">
                            <li><Link to="/cs" onClick={scrollToTop} className="hover:text-[#39B54A] transition-colors">고객센터</Link></li>
                            <li><Link to="/notices" onClick={scrollToTop} className="hover:text-[#39B54A] transition-colors">공지사항</Link></li>
                            <li><Link to="/terms" onClick={scrollToTop} className="hover:text-[#39B54A] transition-colors">이용약관</Link></li>
                            <li><Link to="/privacy" onClick={scrollToTop} className="hover:text-gray-900 font-bold transition-colors">개인정보처리방침</Link></li>
                        </ul>
                    </div>

                    {/* Col 4: Contact Info */}
                    <div className="lg:col-span-4">
                        <h4 className="font-extrabold text-gray-900 mb-5 text-[15px]">Contact Us</h4>
                        <div className="flex flex-col gap-2.5 text-[13px] text-gray-500 tracking-tight">
                            <p><strong className="font-semibold text-gray-700 w-24 inline-block">대표이사</strong> 이기섭</p>
                            <p><strong className="font-semibold text-gray-700 w-24 inline-block">사업자등록번호</strong> 305-30-85537</p>
                            <p><strong className="font-semibold text-gray-700 w-24 inline-block">통신판매업신고</strong> 2025-대전대덕-0526</p>
                            <p><strong className="font-semibold text-gray-700 w-24 inline-block">E-mail</strong> hm_solution@naver.com</p>
                            <p><strong className="font-semibold text-gray-700 w-24 inline-block">TEL</strong> 010-4074-6967</p>
                            <div className="flex mt-1">
                                <strong className="font-semibold text-gray-700 w-24 shrink-0 mt-0.5">주소</strong>
                                <span className="leading-relaxed">
                                    대전광역시 대덕구 대화로106번길 66<br/>
                                    펜타플렉스 705호 (34365)
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Copyright & Main Number */}
                <div className="mt-16 pt-6 border-t border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[13px] text-gray-400 font-medium">
                        Copyright © {new Date().getFullYear()} 행사어때. All rights reserved.
                    </p>
                    <p className="text-[14px] text-gray-500 font-medium flex items-center gap-2">
                        고객센터 <span className="text-[18px] font-extrabold text-gray-900 tracking-tight">1800-1985</span>
                    </p>
                </div>
                
                {/* Floating Action Buttons */}
                {!isProductDetailPage && (
                    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[60] flex flex-col gap-2">
                        <a
                            href="http://pf.kakao.com/_iRxghX/chat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-all overflow-hidden drop-shadow-md rounded-full"
                            aria-label="카카오톡 채널 상담"
                            title="카카오톡 상담"
                        >
                            <img src="/kakao.png" alt="카카오톡 채널" className="w-12 h-12 md:w-14 md:h-14" decoding="async" />
                        </a>

                        <button
                            onClick={scrollToTop}
                            className="w-12 h-12 md:w-14 md:h-14 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center rounded-full drop-shadow-sm"
                            aria-label="Scroll to top"
                        >
                            <ArrowUpIcon className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                    </div>
                )}

            </Container>
        </footer>
    );
}
