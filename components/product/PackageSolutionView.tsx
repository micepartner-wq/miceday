import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../src/api/productApi';
import { Zap, Coffee, Megaphone, MonitorPlay, ArrowRight, Layers, ChevronRight, FileText, CheckCircle2, MessageSquare } from 'lucide-react';

const getDynamicSubtitle = (name: string) => {
  if (name.includes('세미나') || name.includes('워크숍') || name.includes('이사회')) return '완벽한 비즈니스를 완성하는 프리미엄 인프라';
  if (name.includes('채용') || name.includes('교육') || name.includes('시험')) return '집중력을 극대화하는 최적의 시스템 구축';
  if (name.includes('전시') || name.includes('박람회') || name.includes('팝업')) return '압도적인 브랜드의 가치를 경험하게 만드는 전시';
  if (name.includes('해커톤') || name.includes('스포츠') || name.includes('IT') || name.includes('코딩')) return '끊김 없는 네트워크, 무결점 하드웨어 지원';
  if (name.includes('사무실') || name.includes('선거') || name.includes('건설') || name.includes('모델하우스')) return '어디서든 즉시 업무를 시작하는 완벽한 인프라';
  if (name.includes('학회') || name.includes('컨퍼런스') || name.includes('데스크') || name.includes('연사')) return '격조 높은 학술 교류를 위한 완벽한 무대';
  if (name.includes('관공서') || name.includes('행정') || name.includes('국정감사') || name.includes('공공기관')) return '신뢰와 권위를 더하는 무결점 행사 시스템';
  if (name.includes('공연') || name.includes('축제') || name.includes('아티스트')) return '현장의 뜨거운 열기를 그대로 전하는 라이브 시스템';
  return '복잡한 현장 세팅, 행사어때가 완벽하게 책임집니다.';
};

interface PackageSolutionViewProps {
  product: Product;
}

export const PackageSolutionView: React.FC<PackageSolutionViewProps> = ({ product }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(-1);
  const processSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let step = 0;
          const interval = setInterval(() => {
            if (step > 3) { // 1회만 실행 (0~3)
              clearInterval(interval);
              setActiveStep(-1); // 애니메이션 종료
            } else {
              setActiveStep(step); // 0,1,2,3 순서
              step++;
            }
          }, 500); // 500ms 간격으로 천천히 여유롭게 1회 연출
          
          observer.disconnect(); // 한 번만 실행
        }
      },
      { threshold: 0.7 } // 섹션이 화면에 거의 다 보일 때(70%) 시작되도록 임계값 상향
    );

    if (processSectionRef.current) {
      observer.observe(processSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleStartQuote = () => {
    window.scrollTo(0, 0);
    navigate(`/contact?package_name=${encodeURIComponent(product.name)}`);
  };

  // ── 픽스된 모듈 데이터 ──
  const modules = [
    {
      title: 'A/V SYSTEM',
      subtitle: '무대 및 A/V 시스템',
      desc: '행사의 몰입도를 극대화하는 하이엔드 시스템',
      details: ['4K 대형 LED 스크린 및 실시간 라이브 중계', '라인어레이 스피커 및 밴드용 음향 콘솔', '지능형 무빙 라이트 및 특수효과 연출'],
      icon: MonitorPlay,
    },
    {
      title: 'SPACE DESIGN',
      subtitle: '공간 연출 및 부스 시공',
      desc: '브랜드 아이덴티티를 각인시키는 공간 설계',
      details: ['프리미엄 옥타/트러스 부스 맞춤형 설계', '참가자 체류 시간을 늘리는 라운지/휴게존', '초대형 현수막 및 사이니지 일체'],
      icon: Layers,
    },
    {
      title: 'POWER INFRA',
      subtitle: '전력망 및 네트워크 설계',
      desc: '단 한 번의 끊김도 허용하지 않는 무결점 인프라',
      details: ['수백 대의 IT 기기를 위한 독립 전력망 구축', '참가자 안전을 위한 완벽한 배선 및 몰딩 마감', '비상시 즉시 투입 가능한 예비 전력/네트워크'],
      icon: Zap,
    },
    {
      title: 'F&B CATERING',
      subtitle: '프리미엄 케이터링',
      desc: '참가자의 만족도를 결정짓는 최상의 퀄리티',
      details: ['행사 성격과 예산에 맞춘 커스텀 메뉴 구성', '대형 쇼케이스 냉장고 렌탈 및 음료 무제한 셋업', '철저한 위생 관리 및 정해진 타임테이블 배식'],
      icon: Coffee,
    },
    {
      title: 'OPERATION',
      subtitle: '현장 운영 및 매니지먼트',
      desc: '주최측은 핵심 기획에만 집중할 수 있도록',
      details: ['돌발 상황에 즉시 대처하는 전문 디렉터 상주', '시상품, 웰컴킷 구매 및 패키징 풀 대행', '행사 종료 후 원상 복구 및 폐기물 완벽 처리'],
      icon: Megaphone,
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: '상담 및 요구사항 분석',
      desc: '클라이언트 미팅을 통해 행사 목적, 타겟, 예산 등 핵심 니즈 파악',
      icon: MessageSquare,
    },
    {
      step: 2,
      title: '사전답사 및 맞춤 견적',
      desc: '현장 사전답사 및 최적의 예산안이 담긴 견적서 전달 및 최종 타임라인 확정',
      icon: FileText,
    },
    {
      step: 3,
      title: '행사 진행',
      desc: '요청 사항에 알맞은 물품 세팅, 시스템 운영 및 촬영 진행',
      icon: Zap,
    },
    {
      step: 4,
      title: '철수 및 사후 정산',
      desc: '신속하고 안전한 철수 및 최종 추가 비용 정산과 행정 처리',
      icon: CheckCircle2,
    }
  ];

  return (
    <div className="min-h-screen font-sans text-gray-950 bg-white">
      
      {/* 1. Hero: 비디오 백그라운드 & 상황 공감 (스토리텔링 1단계) */}
      {/* 전체 화면을 채우도록 h-screen 적용, 텍스트를 좌측 상단으로 배치 (조금 더 아래로 이동) */}
      <section className="relative w-full h-screen min-h-[700px] flex items-start justify-start overflow-hidden pt-48 md:pt-64 lg:pt-72">
        {/* 비디오 배경 */}
        <div className="absolute inset-0 z-0 bg-black">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
            {/* 만약 비디오가 안나올 경우를 대비한 대체 이미지 */}
            <img src={product.image_url || '/placeholder.jpg'} alt="fallback" className="w-full h-full object-cover" />
          </video>
          {/* 가독성을 극대화하는 전체 다크 오버레이 */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* 텍스트 컨텐츠 (좌측 상단 정렬) */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-start animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-5 drop-shadow-2xl break-keep">
            {product.name}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl font-light leading-relaxed drop-shadow-md max-w-3xl break-keep">
            {getDynamicSubtitle(product.name)}
          </p>
        </div>
      </section>

      {/* 2. 토탈 솔루션 섹션 (스토리텔링 2단계: 한 화면에 쏙 들어오는 카드 그리드 레이아웃) */}
      <section className="bg-gray-50 py-24 md:py-32 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 세련된 에디토리얼 스타일의 헤더 (References 섹션과 스타일 통일) */}
          <div className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-l-4 border-[#39B54A] pl-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#39B54A] mb-2 uppercase">
                A to Z
              </h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.2] break-keep">
                보이지 않는 곳까지<br className="hidden md:block"/>트렌디하게</h3>
            </div>
          </div>

          {/* 1920 해상도에서 한 눈에 보이도록 Grid 대신 Flex 중앙 정렬 (위 3개, 아래 2개 배치) */}
          <div className="flex flex-wrap justify-center gap-6">
            {modules.map((mod, idx) => (
              <div 
                key={idx} 
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white border border-gray-200 p-8 hover:border-[#39B54A] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                {/* 상단 장식 바 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-[#39B54A] transition-colors"></div>
                
                <mod.icon className="w-10 h-10 text-[#39B54A] mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-xs font-bold tracking-widest text-gray-400 mb-1 uppercase">{mod.title}</h4>
                <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">{mod.subtitle}</h3>
                <p className="text-sm text-gray-500 mb-8 flex-grow leading-relaxed font-medium">{mod.desc}</p>
                
                <ul className="space-y-3 mt-auto pt-6 border-t border-gray-100">
                  {mod.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start text-gray-600 text-[13px] font-medium leading-relaxed">
                      <ChevronRight className="w-4 h-4 mr-2 text-[#39B54A] flex-shrink-0 mt-0.5" />
                      <span className="break-keep">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.5. 업무 프로세스 (Process) */}
      <section ref={processSectionRef} className="bg-gray-950 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-20 flex flex-col items-center text-center">
            <h2 className="text-sm font-bold tracking-widest text-[#39B54A] mb-2 uppercase">
              Process
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-[1.2] break-keep">
              컴팩트한 과정<br className="hidden md:block"/>업무 진행 프로세스
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 relative">
            {processSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div key={idx} className="relative group flex">
                  {/* 1920 해상도 등 큰 화면에서 카드 사이에 나타날 꺾쇠 화살표 */}
                  {idx < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-30 text-white opacity-80 pointer-events-none">
                      <ChevronRight className="w-8 h-8" />
                    </div>
                  )}
                  
                  <div className={`w-full h-full p-8 rounded-[2rem] flex flex-col items-center text-center transition-all duration-500 cursor-pointer z-10 group-hover:bg-white group-hover:text-gray-900 lg:group-hover:scale-105 group-hover:shadow-2xl group-hover:z-20 ${
                    isActive ? "bg-white text-gray-900 lg:scale-105 shadow-2xl !z-20" : "bg-[#111111] text-white"
                  }`}>
                    {/* Number Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-6 transition-colors duration-500 group-hover:bg-gray-100 group-hover:text-gray-900 group-hover:border group-hover:border-gray-200 ${
                      isActive ? "bg-gray-100 text-gray-900 border border-gray-200" : "bg-gray-800 text-gray-300"
                    }`}>
                      {step.step}
                    </div>
                    
                    <step.icon className={`w-8 h-8 mb-6 transition-colors duration-500 group-hover:text-gray-900 ${
                      isActive ? "text-gray-900" : "text-gray-400"
                    }`} />
                    
                    <h4 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h4>
                    <p className={`text-[15px] leading-relaxed break-keep font-light transition-colors duration-500 group-hover:text-gray-600 group-hover:font-medium ${
                      isActive ? "text-gray-600 font-medium" : "text-gray-400"
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. 시각적 증명 (스토리텔링 3단계: 리얼 현장 갤러리) */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-[#39B54A] pl-6">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[#39B54A] mb-2 uppercase">References</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.2]">
                완벽한 세팅이 만드는<br/>압도적인 현장감
              </h3>
            </div>
          </div>
          
          {/* Masonry 형태의 비대칭 그리드 갤러리 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[280px]">
            <div className="col-span-2 row-span-2 bg-gray-100 rounded-lg overflow-hidden group relative">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200" alt="대규모 컨퍼런스 세팅" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold text-lg">초대형 LED 스크린 및 무대 세팅</span>
              </div>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-200 rounded-lg overflow-hidden group relative">
              <img src="https://images.unsplash.com/photo-1520110120835-c96534a4c984?auto=format&fit=crop&q=80&w=800" alt="음향 콘솔" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold">프로페셔널 음향 콘솔</span>
              </div>
            </div>
            <div className="col-span-1 row-span-2 bg-gray-300 rounded-lg overflow-hidden group relative">
              <img src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800" alt="케이터링 라운지" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold">프리미엄 케이터링 라운지</span>
              </div>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-100 rounded-lg overflow-hidden group relative">
              <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800" alt="조명 트러스" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold">하이엔드 조명 트러스</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA 영역 삭제됨 (하단 고정 바가 역할을 대체함) */}
      {/* 5. 하단 고정 바 (Sticky Bottom Bar) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/50 bg-white/60 py-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:py-5">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="hidden sm:block">
            <p className="text-xs tracking-widest text-[#39B54A] uppercase font-bold mb-1">PACKAGE Selected</p>
            <p className="text-lg font-extrabold text-gray-900 line-clamp-1">{product.name}</p>
          </div>
          <button 
            onClick={handleStartQuote}
            className="group flex w-full items-center justify-center bg-gray-900 px-8 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-[#39B54A] hover:shadow-[0_8px_20px_rgba(57,181,74,0.3)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 sm:w-auto text-[15px] rounded-full"
          >
            견적 문의 
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

    </div>
  );
};
