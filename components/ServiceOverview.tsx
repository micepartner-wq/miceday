import React, { useEffect, useState } from 'react';
import { getServiceImages, SERVICE_IMAGE_SLOTS } from '../src/api/serviceOverviewApi';
import { Link } from 'react-router-dom';
import { PanelsTopLeft, Armchair, UsersRound, ArrowUpRight, Check } from 'lucide-react';

const services = [
    { icon: PanelsTopLeft, title: '공간·장비', subtitle: '행사의 무대를 만듭니다', description: '장소와 행사 규모에 맞는 공간을 구성하고 필요한 장비를 설치합니다.', items: ['전시 부스 · 무대 · 포토존', '음향 · 영상 · 조명 시스템'] },
    { icon: Armchair, title: '비품·제작물', subtitle: '작은 준비까지 챙깁니다', description: '가구부터 인쇄물, 다과까지 현장에 필요한 물품을 함께 준비합니다.', items: ['테이블 · 의자 · 냉장고', '현수막 · 인쇄물 · 간식'] },
    { icon: UsersRound, title: '인력·운영', subtitle: '현장의 흐름을 이어갑니다', description: '설치와 리허설부터 진행, 마무리까지 역할에 맞는 인력을 지원합니다.', items: ['행사 MC · 운영 및 안전 인력', '현장 디렉팅 · 영상 촬영'] },
];

export const ServiceOverview = () => {
    const [serviceImages, setServiceImages] = useState(SERVICE_IMAGE_SLOTS);
    useEffect(() => {
        let active = true;
        getServiceImages().then(images => { if (active) setServiceImages(images); })
            .catch(error => console.error('서비스 소개 이미지 조회 실패:', error));
        return () => { active = false; };
    }, []);
    return <>
    <div className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end">
        <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-[#278337]">행사어때가 함께하는 일</p>
            <h2 className="text-3xl font-bold leading-snug tracking-tight text-slate-900 sm:text-4xl break-keep">필요한 만큼 맡기고,<br className="sm:hidden" /> 중요한 일에 집중하세요.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base break-keep">공간을 채우는 장비부터 현장을 움직이는 사람까지, 한곳에서 준비합니다.</p>
        </div>
        <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="inline-flex shrink-0 items-center gap-3 self-start border-b border-[#278337]/40 pb-2 text-sm font-semibold text-[#246b35] md:self-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">필요한 서비스 상담하기 <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
    <div className="grid overflow-hidden rounded-2xl border border-[#dce3d7] bg-white md:grid-cols-3">
        {services.map((service, index) => <article key={service.title} className={`p-7 md:p-8 lg:p-9 ${index > 0 ? 'border-t border-[#e2e7dd] md:border-l md:border-t-0' : ''}`}>
            <div className="mb-6 flex items-center justify-between"><service.icon size={32} strokeWidth={1.4} className="text-[#278337]" aria-hidden="true" /><span className="text-xs font-medium tracking-widest text-slate-400" aria-hidden="true">0{index + 1}</span></div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">{service.title}</h3>
            <p className="mt-2 text-sm font-medium text-[#42734a]">{service.subtitle}</p>
            <div className="mt-5 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
                <img src={serviceImages[index].src} alt={serviceImages[index].alt} width={800} height={450} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-500 break-keep">{service.description}</p>
            <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5">{service.items.map(item => <li key={item} className="flex items-start gap-2 text-xs leading-6 text-slate-700 sm:text-sm"><Check size={14} className="mt-1 shrink-0 text-[#278337]" aria-hidden="true" />{item}</li>)}</ul>
        </article>)}
    </div>
</>;
};
