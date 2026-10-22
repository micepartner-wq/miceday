import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ClipboardList, Users, CalendarCheck } from 'lucide-react';
import { Container } from './ui/Container';
import { getInstallationCasesPage, type InstallationCase } from '../src/api/contentApi';
import { getResponsiveImageProps } from '../src/utils/responsiveImage';

export const FeaturedCases = () => {
  const [items, setItems] = useState<InstallationCase[]>([]);
  useEffect(() => {
    let active = true;
    getInstallationCasesPage({ page: 1, pageSize: 3 }).then(result => {
      if (active) setItems(result.data);
    }).catch(error => console.error('Failed to load featured cases:', error));
    return () => { active = false; };
  }, []);
  if (!items.length) return null;
  return (
    <section className="bg-white py-16 md:py-24" aria-labelledby="featured-cases-title">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12">
          <div>
            <p className="mb-3 text-sm font-semibold text-green-800">현장사례</p>
            <h2 id="featured-cases-title" className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">행사어때에서 만들어낸 결과</h2>
            <p className="mt-4 break-keep text-base leading-7 text-slate-600">행사별 현장 사진과 실제 수행 내용을 확인해 보세요.</p>
          </div>
          <Link to="/cases" className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-slate-700">레퍼런스 전체 보기 <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map(item => (
            <Link key={item.id} to={`/cases/${item.id}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white">
              {item.image_url && <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img {...getResponsiveImageProps(item.image_url, { widths: [480, 800, 1024], sizes: '(max-width: 768px) 100vw, 33vw', quality: 80 })} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /></div>}
              <div className="p-6">
                {item.category && <p className="mb-3 text-xs font-semibold text-green-800">{item.category}</p>}
                <h3 className="break-keep text-xl font-bold leading-snug text-slate-900">{item.title}</h3>
                {item.summary && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>}
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-800">사례 자세히 보기 <ArrowUpRight size={16} aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};

const planningTopics = [
  { icon: ClipboardList, title: '어디까지 맡기고 싶으신가요?', text: '전체 기획부터 필요한 장비·인력 지원까지, 요청하실 업무와 내부에서 준비할 업무를 구분해 주세요.', points: ['행사 목적과 참석 대상', '필요한 서비스와 담당 범위', '고객사에서 준비할 자료'] },
  { icon: CalendarCheck, title: '현장에서 무엇이 중요한가요?', text: '장소 조건과 행사 일정을 바탕으로, 설치부터 철수까지 확인할 운영 사항을 정리합니다.', points: ['반입·설치·리허설·철수 시간', '공간 배치와 장비 요구 사항', '현장 연락 체계와 변경 대응'] },
  { icon: Users, title: '어떤 조건으로 진행하나요?', text: '견적을 비교할 때는 총액과 함께 포함 항목, 운영 시간, 추가 요청에 따른 비용 조건을 확인해 주세요.', points: ['장비·인력·운송·설치 비용', '부가세 및 포함·제외 항목', '추가 요청과 일정 변경 조건'] },
];

export const EventPlanningGuide = () => (
  <section className="border-y border-slate-100 bg-slate-50 py-16 md:py-24" aria-labelledby="planning-guide-title">
    <Container>
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-sm font-semibold text-green-800">행사 준비 가이드</p>
        <h2 id="planning-guide-title" className="break-keep text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">막연한 준비를,<br />구체적인 확인 사항으로.</h2>
        <p className="mt-5 text-base leading-7 text-slate-600">모든 계획이 정해져 있지 않아도 괜찮습니다. 상담을 시작할 때 아래 세 가지를 함께 살펴보세요.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {planningTopics.map((topic, index) => <article key={topic.title} className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between text-green-800"><topic.icon size={26} strokeWidth={1.5} aria-hidden="true" /><span className="text-sm font-medium text-slate-400">0{index + 1}</span></div>
          <h3 className="break-keep text-xl font-bold text-slate-900">{topic.title}</h3>
          <p className="mb-6 mt-4 text-sm leading-7 text-slate-600">{topic.text}</p>
          <ul className="space-y-3 border-t border-slate-100 pt-5">{topic.points.map(point => <li key={point} className="flex gap-2 text-sm leading-6 text-slate-700"><span className="text-green-700" aria-hidden="true">✓</span>{point}</li>)}</ul>
        </article>)}
      </div>
      <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center md:p-8">
        <div><h3 className="text-lg font-bold">일정·장소·예산이 아직 미정인가요?</h3><p className="mt-2 text-sm leading-6 text-slate-300">간편 상담은 담당자 성함과 연락처만으로 시작할 수 있습니다.</p></div>
        <Link to="/contact" className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900">행사 상담하기</Link>
      </div>
    </Container>
  </section>
);
