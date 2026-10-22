import React, { useState, useEffect, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { supabase } from '../../src/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from '../../src/utils/useReducedMotion';

export const SpaceCarousel = () => {
    const reducedMotion = useReducedMotion();
    const [items, setItems] = useState<any[]>([]);
    const [virtualIndex, setVirtualIndex] = useState(0); // Set after items are loaded
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    
    const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setVw(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchSpaces = async () => {
            const { data } = await supabase
                .from('event_spaces_cards')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (data && data.length > 0) {
                setItems(data);
                setVirtualIndex(data.length * 10000); // safe large number
            } else {
                const fallbacks = [
                    { id: '1', title: '기업 공식 행사', subtitle: '호텔 대관', image_url: 'https://images.unsplash.com/photo-1582719478250-c89400bb1536?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
                    { id: '2', title: '채용 박람회', subtitle: '갤러리 대관', image_url: 'https://images.unsplash.com/photo-1544498522-83023e3e4a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
                    { id: '3', title: '기업 워크숍', subtitle: '리조트 대관', image_url: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' }
                ];
                setItems(fallbacks);
                setVirtualIndex(fallbacks.length * 10000);
            }
        };
        fetchSpaces();
    }, []);

    const isMobile = vw < 768;
    const itemWidth = Math.min(isMobile ? vw * 0.85 : vw * 0.55, 1000);
    const gap = isMobile ? 16 : 32;

    const handlePrev = () => setVirtualIndex(prev => prev - 1);
    const handleNext = () => setVirtualIndex(prev => prev + 1);

    // 4초마다 자동으로 다음 슬라이드로 넘어가는 Autoplay 기능
    useEffect(() => {
        if (isDragging || reducedMotion || items.length === 0) return;
        
        const autoplayTimer = setInterval(() => {
            setVirtualIndex(prev => prev + 1);
        }, 4000);
        
        return () => clearInterval(autoplayTimer);
    }, [isDragging, reducedMotion, items.length]);

    const handleDragStart = (x: number) => {
        setIsDragging(true);
        setStartX(x);
    };

    const handleDragMove = (x: number) => {
        if (!isDragging) return;
        setDragOffset(x - startX);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const threshold = itemWidth / 4;
        if (dragOffset > threshold) {
            handlePrev();
        } else if (dragOffset < -threshold) {
            handleNext();
        }
        setDragOffset(0);
    };

    if (items.length === 0) return null;

    const N = items.length;
    const activeDataIndex = ((virtualIndex % N) + N) % N;
    
    // Render -2 to +2 items around the virtualIndex
    const offsets = [-2, -1, 0, 1, 2];

    return (
        <div className="w-full relative overflow-hidden">
            <div className="text-center mb-12 px-4">
                <p className="text-slate-500 text-sm sm:text-base font-semibold mb-2 break-keep">워크숍, 팀빌딩 프로그램, 체육대회, 송년회</p>
                <h2 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold text-slate-900 tracking-tight break-keep">
                    기업 맞춤형 장소 섭외
                </h2>
            </div>

            {/* Slider Container - Full width */}
            <div 
                className="relative w-full h-[75vw] md:h-[32vw] max-h-[600px] min-h-[400px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing group"
                onMouseDown={(e) => handleDragStart(e.pageX)}
                onMouseMove={(e) => handleDragMove(e.pageX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].pageX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].pageX)}
                onTouchEnd={handleDragEnd}
            >
                {offsets.map(offset => {
                    const vIndex = virtualIndex + offset;
                    const dIndex = ((vIndex % N) + N) % N;
                    const item = items[dIndex];
                    
                    const xPos = offset * (itemWidth + gap) + dragOffset;
                    const isActive = offset === 0;

                    return (
                        <div
                            key={vIndex}
                            className={`absolute top-0 left-1/2 flex flex-col h-full ${isDragging ? '' : 'transition-all duration-500 ease-out'}`}
                            style={{
                                width: `${itemWidth}px`,
                                transform: `translateX(calc(-50% + ${xPos}px))`,
                                zIndex: isActive ? 10 : 5
                            }}
                        >
                            <div className="relative rounded-3xl overflow-hidden h-full shadow-lg">
                                <img 
                                    src={item.image_url} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover pointer-events-none" 
                                />
                                {/* 화이트 오버레이: 중앙 슬라이드가 아닐 경우 덮어씌움 */}
                                <div 
                                    className={`absolute inset-0 bg-white/70 pointer-events-none ${isDragging ? '' : 'transition-opacity duration-500 ease-out'} ${isActive ? 'opacity-0' : 'opacity-100'}`}
                                ></div>
                                
                                {/* 이미지 내부 하단 페이지네이션(점선) */}
                                {isActive && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                                        {items.map((_, dotIdx) => (
                                            <div 
                                                key={dotIdx} 
                                                className={`h-2 rounded-full transition-all duration-300 ${activeDataIndex === dotIdx ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 텍스트 설명 (이미지 아래 위치) */}
                            <div className={`mt-5 px-2 ${isDragging ? '' : 'transition-opacity duration-500'} ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                <h4 className="font-extrabold text-base sm:text-lg md:text-xl text-slate-900 flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 break-keep text-center sm:text-left">
                                    {item.title} 
                                    <span className="text-slate-300 font-normal hidden sm:inline">|</span> 
                                    <span className="text-slate-500 font-medium text-sm sm:text-base">{item.subtitle}</span>
                                </h4>
                            </div>
                        </div>
                    );
                })}

                {/* 네비게이션 화살표 */}
                <button type="button" aria-label="이전 장소"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute top-[40%] -translate-y-1/2 left-4 md:left-12 z-20 w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-[#39B54A] transition-all cursor-pointer border border-slate-100 group-hover:opacity-100 opacity-0 md:opacity-100"
                >
                    <ChevronLeft size={28} />
                </button>
                <button type="button" aria-label="다음 장소"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute top-[40%] -translate-y-1/2 right-4 md:right-12 z-20 w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-[#39B54A] transition-all cursor-pointer border border-slate-100 group-hover:opacity-100 opacity-0 md:opacity-100"
                >
                    <ChevronRight size={28} />
                </button>
            </div>
            
            {/* 전체 진행률 바 (옵션) */}
            <div className="max-w-[300px] mx-auto mt-8 relative z-20">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
                    <span>{String(activeDataIndex + 1).padStart(2, '0')}</span>
                    <span>{String(N).padStart(2, '0')}</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#39B54A] transition-all duration-300"
                        style={{ width: `${((activeDataIndex + 1) / N) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
