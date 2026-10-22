import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageCircleMore, Target, Layout, Mic, Package, Briefcase } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Hero } from '../components/Hero';
import { SpaceCarousel } from '../components/ui/SpaceCarousel';
import { PartnerCarousel } from '../components/PartnerCarousel';
import { supabase } from '../src/lib/supabase';
import { FeaturedCases, EventPlanningGuide } from '../components/BusinessTrust';
import { useReducedMotion } from '../src/utils/useReducedMotion';
// Scroll fade-in animation component
const FadeInSection = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const MarqueeContainer = () => {
    const reducedMotion = useReducedMotion();
    const speedRef = useRef(1); // 1 = normal speed
    const posRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const [items, setItems] = useState<any[]>([]);
    
    // Drag and Momentum state
    const isDraggingRef = useRef(false);
    const lastXRef = useRef(0);
    const lastTimeRef = useRef(0);
    const momentumRef = useRef(-1.5);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('event_marquee_cards')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (data && data.length > 0) {
                setItems(data);
            } else {
                // DB에 데이터가 없을 때 기본 플레이스홀더 데이터
                setItems([
                    { title: '커피차데이', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=640&h=800&q=80' },
                    { title: '워크샵', image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&w=640&h=800&q=80' },
                    { title: '신년회·송년회', image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&w=640&h=800&q=80' },
                    { title: '창립기념일', image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&w=640&h=800&q=80' },
                ]);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (reducedMotion && containerRef.current) {
            posRef.current = 0;
            containerRef.current.style.transform = 'translateX(0)';
        }
        if (items.length === 0 || reducedMotion) return;

        const updatePosition = () => {
            if (containerRef.current) {
                if (!isDraggingRef.current) {
                    // 드래그 중이 아닐 때는 목표 속도(targetSpeed)를 향해 부드럽게 감속/가속 (Inertia Scroll)
                    const targetSpeed = -1.5 * speedRef.current;
                    momentumRef.current += (targetSpeed - momentumRef.current) * 0.05;
                    posRef.current += momentumRef.current;
                }
                
                // container 내부의 전체 너비에서 세트 개수(4)로 나누어 1세트 너비 계산
                const scrollWidth = containerRef.current.scrollWidth;
                const maxScroll = scrollWidth / 4;
                
                // 양방향 무한 스크롤 처리
                if (posRef.current <= -maxScroll) {
                    posRef.current += maxScroll;
                } else if (posRef.current > 0) {
                    posRef.current -= maxScroll;
                }
                containerRef.current.style.transform = `translateX(${posRef.current}px)`;
            }
            requestRef.current = requestAnimationFrame(updatePosition);
        };

        requestRef.current = requestAnimationFrame(updatePosition);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [items, reducedMotion]);

    const handleMouseEnter = () => {
        speedRef.current = 0; // 마우스 오버 시 목표 속도를 0으로 설정 (서서히 멈춤)
    };

    const handleMouseLeaveContainer = () => {
        if (isDraggingRef.current) {
            if (performance.now() - lastTimeRef.current > 50) {
                momentumRef.current = 0;
            }
        }
        isDraggingRef.current = false;
        speedRef.current = 1; // 마우스가 떠나면 원래 속도로 복귀
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        isDraggingRef.current = true;
        const x = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
        lastXRef.current = x;
        lastTimeRef.current = performance.now();
        momentumRef.current = 0; // 잡는 순간 기존 관성 제거
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingRef.current) return;
        
        const x = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
        const now = performance.now();
        const dt = now - lastTimeRef.current;
        const dx = x - lastXRef.current;

        if (dt > 0) {
            // 순간 속도 측정 (프레임 간 이동량)
            momentumRef.current = dx * 1.5;
        }

        posRef.current += dx * 1.5;
        
        lastXRef.current = x;
        lastTimeRef.current = now;
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        // 멈춘 상태에서 놓으면 관성 제거
        if (performance.now() - lastTimeRef.current > 50) {
            momentumRef.current = 0;
        }
    };

    if (items.length === 0) return null;

    return (
        <div 
            className="w-full overflow-hidden py-4 select-none touch-pan-y"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeaveContainer}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        >
            <div ref={containerRef} className="flex w-max will-change-transform pointer-events-none">
                {(reducedMotion ? [1] : [1, 2, 3, 4]).map((setIndex) => (
                    <div key={`set-${setIndex}`} className="flex gap-6 pr-6">
                        {items.map((item, idx) => (
                            <div key={`item-${setIndex}-${idx}`} className="shrink-0 flex flex-col items-center gap-4">
                                <div className="w-[320px] h-[400px] rounded-[2rem] overflow-hidden relative shadow-lg shadow-slate-200/50">
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
                                </div>
                                <span className="text-slate-900 font-bold text-lg tracking-tight">{item.title}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const promises = [
    { title: '1:1 전담 디렉팅', desc: '상담부터 현장까지 단일 창구' },
    { title: '투명한 정찰제', desc: '숨은 추가 비용 없는 정직한 견적' },
    { title: 'A to Z 통합 운영', desc: '외주 최소화로 완벽한 행사 통제' },
    { title: 'MICE 공식 협력사', desc: '대전·충청 MICE 얼라이언스 회원사' },
];

export const MainPage = () => {
    return (
        <main className="bg-white overflow-clip">
            <Hero />
            <FeaturedCases />



{/* 신규: 센터 포커스형 장소 갤러리 */}
            <section className="py-24 bg-white">
                <SpaceCarousel />
            </section>

<section className="py-24 bg-slate-50 overflow-hidden border-y border-slate-100">
                <FadeInSection>
                <Container>
                    <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto flex flex-col items-center">
                        
                        <h2 className="text-2xl sm:text-3xl md:text-[40px] lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.35] md:leading-[1.25] mb-6 break-keep">
                            사소한 비품부터 대형 시스템까지<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39B54A] to-[#268a33]">'종합 대행' 역량 솔루션</span>
                        </h2>
                        <p className="text-slate-500 text-base sm:text-lg md:text-xl font-medium leading-relaxed break-keep">
                            부스 시공부터 화려한 무대 연출, 행사의 디테일까지 행사어때가 완벽하게 통제합니다.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="group rounded-[2rem] bg-white border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col">
                            <div className="h-56 bg-slate-100 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="전시 부스 및 시설물" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-6">
                                    <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">System & Facilities</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-3">전시 부스 및 무대 시공</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    대규모 옥타늄 전시 부스 시공, 무대 음향 및 특수조명 시스템, 포토존 및 이벤트 공간 제작, 행사의 뼈대가 되는 강력한 하드웨어를 세팅합니다.
                                </p>
                            </div>
                        </div>

                        <div className="group rounded-[2rem] bg-white border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col">
                            <div className="h-56 bg-slate-100 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="운영 비품 및 제작물" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-6">
                                    <span className="px-3 py-1 bg-[#39B54A]/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">Detailed Operation</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-3">디테일한 운영 비품 및 인쇄물</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    대형 현수막과 포스터 출력, 쇼케이스 냉장고, 테이블 세트, 빈백 의자부터 참가자 간식과 이벤트 경품 구매/세팅까지 담당자의 수고를 덜어드립니다.
                                </p>
                            </div>
                        </div>

                        <div className="group rounded-[2rem] bg-white border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col">
                            <div className="h-56 bg-slate-100 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="전문 인력 및 현장 운영" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-6">
                                    <span className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">Directing & Staff</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-3">전문 인력 및 현장 디렉팅</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    경험 많은 총괄 연출자와 행사 전문 MC 섭외, 안전 요원 배치 및 영상 촬영, 매끄러운 진행을 책임질 검증된 스태프를 투입합니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
                </FadeInSection>
            </section>

{/* 1. 다양한 이벤트 프로그램 (Auto-Scrolling Marquee - JS 기반으로 점프 현상 해결) */}
            <section className="py-24 md:py-32 bg-white overflow-hidden">
                <FadeInSection>
                    <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
                        
                        <h2 className="text-2xl sm:text-3xl md:text-[40px] lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.35] md:leading-[1.25] mb-6 break-keep">
                           행사의 모든 것
                        </h2>
                        <p className="text-slate-500 text-base sm:text-lg md:text-xl font-medium leading-relaxed break-keep max-w-2xl mx-auto">
                            행사부스, 워크숍, 세미나, 교육박람회 등 목적에 맞는 최적의 프로그램을 제안합니다.
                        </p>
                    </div>
                </FadeInSection>

                <div className="w-full relative overflow-hidden">
                    <MarqueeContainer />
                </div>
            </section>

<section className="bg-slate-950 py-12 md:py-16 text-white relative z-20 shadow-2xl">
                <FadeInSection delay={100}>
                <Container>
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 divide-x divide-white/10">
                        {promises.map((promise, idx) => (
                            <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white mb-3 break-keep">
                                    {promise.title}
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base font-medium text-[#39B54A] tracking-wide break-keep">
                                    {promise.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </Container>
                </FadeInSection>
            </section>

{/* 2. 핵심 가치 (Core Values) */}
            <section className="py-24 bg-white relative overflow-hidden">
                <FadeInSection>
                <Container>
                    <div className="mb-16 md:mb-20 text-center max-w-4xl mx-auto relative z-10 flex flex-col items-center">
                        <h2 className="text-2xl sm:text-3xl md:text-[40px] lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.35] md:leading-[1.25] mb-6 break-keep">
                            모든 것이 완벽해야 하는 <span className="text-[#39B54A]">날.</span>
                        </h2>
                        <p className="text-slate-500 text-base sm:text-lg md:text-xl font-medium leading-relaxed break-keep">
                            행사어때가 기획부터 운영, 철수까지 모든 과정을 완벽하게 책임집니다.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Target, title: '맞춤 기획', desc: '행사 목적과 예산에 맞는 최적의 기획안을 제안합니다.' },
                            { icon: Layout, title: '공간 연출', desc: '컨셉에 맞는 무대, 부스, 조명 등 공간을 완벽히 세팅합니다.' },
                            { icon: Briefcase, title: '현장 운영', desc: '행사 전 사전 설치부터 마무리 및 회수까지 모든 과정을 책임집니다.' },
                            { icon: Package, title: '장비 렌탈', desc: 'IT 기기부터 음향·영상 장비까지 원스톱으로 제공합니다.' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
                                <div className="w-16 h-16 mx-auto bg-[#39B54A]/5 text-[#39B54A] rounded-2xl flex items-center justify-center mb-6">
                                    <item.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500 text-[15px] leading-relaxed break-keep">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
                </FadeInSection>
            </section>

{/* Empathy Full Banner (Parallax Scrolling) */}
            <section 
                className="relative py-24 md:py-32 flex items-center justify-center text-center overflow-hidden bg-fixed bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80')" }}
            >
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
                <div className="relative z-10 px-4 max-w-4xl mx-auto">
                    <FadeInSection>
                        <p className="text-[#39B54A] font-bold tracking-widest mb-4 uppercase text-sm md:text-base">TRUSTED BY</p>
                        <h2 className="text-2xl sm:text-3xl md:text-[40px] lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.4] md:leading-[1.3] break-keep">
                            이미 수많은 기업과 기관들이<br/>
                            행사어때와 성공적인 비즈니스를<br className="md:hidden" /> 경험했습니다
                        </h2>
                    </FadeInSection>
                </div>
            </section>

<div className="bg-white py-4">
                <PartnerCarousel />
            </div>

{/* 기존 고객 후기 (Star Reviews) */}
            <section className="py-24 bg-white border-b border-slate-100">
                <Container>
                    <FadeInSection>
                        <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
                            
                            <h2 className="text-2xl sm:text-3xl md:text-[40px] lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.35] md:leading-[1.25] break-keep">
                                고객이 증명하는 완벽한 행사
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                 {
                                    company: '공공기관',
                                    type: '학술 컨퍼런스',
                                    quote: '엄격한 절차와 서류 작업이 필요한 관공서 행사임에도 불구하고, 모든 행정 처리를 완벽하게 지원해주십니다. 매년 진행하는 행사인데 오래 전부터 맡겨와서 지금은 저희보다 더 믿음이갑니다.',
                                },
                                {
                                    company: 'IT 솔루션 기업',
                                    type: '워크샵 체육대회',
                                    quote: '대규모 인원이라 준비가 막막했는데, 게임 도구부터 간식, MC 섭외까지 한 번에 해결해주셔서 담당자 입장에서 정말 편했습니다. 직원들 반응도 최고였어요!',
                                },
                                {
                                    company: '보고/역량 평가 발표회',
                                    type: '창립 5주년 기념 워크샵',
                                    quote: '호텔 연회장 대관부터 무대 연출까지, 꼼꼼한 기획 덕분에 저희 회사의 품격이 올라가는 느낌이었습니다. 내년에도 꼭 다시 부탁드릴 예정입니다.',
                                }

                            ].map((review, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/40 flex flex-col h-full transition-transform duration-300">
                                    <div className="flex text-[#FEE500] mb-5">
                                        <Star size={20} fill="currentColor" />
                                        <Star size={20} fill="currentColor" />
                                        <Star size={20} fill="currentColor" />
                                        <Star size={20} fill="currentColor" />
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-[15px] mb-8 flex-1 italic break-keep">
                                        "{review.quote}"
                                    </p>
                                    <div>
                                        <p className="font-bold text-slate-900">{review.company}</p>
                                        <p className="text-slate-400 text-sm mt-1">{review.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FadeInSection>
                </Container>
            </section>

<EventPlanningGuide />

{/* CTA Section */}
            <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-slate-950/40 to-transparent"></div>
                <Container>
                    <FadeInSection>
                        <div className="text-center relative z-10">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-[1.35] md:leading-[1.2] mb-6 tracking-tight drop-shadow-md break-keep">
                                행사 준비, 아직도 막막하신가요?
                            </h2>
                            <p className="text-slate-300 text-base sm:text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto break-keep leading-relaxed drop-shadow">
                                1분 만에 상담을 신청하고 행사어때의 무료 맞춤 견적과 기획안을 받아보세요. 담당자님의 부담을 완벽하게 덜어드립니다.
                            </p>
                            <Link 
                                to="/contact" 
                                onClick={() => window.scrollTo(0, 0)}
                                className="inline-flex items-center justify-center gap-3 bg-[#39B54A] text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 hover:bg-[#32a342] hover:shadow-2xl hover:shadow-[#39B54A]/20 transition-all duration-300"
                            >
                                <MessageCircleMore size={24} />
                                1:1 맞춤 견적 신청하기
                            </Link>
                        </div>
                    </FadeInSection>
                </Container>
            </section>
        </main>
    );
};
