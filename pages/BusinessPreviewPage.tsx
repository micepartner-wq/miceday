import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, ArrowRight, Check, ClipboardList, Download, MapPin, Plus, Minus } from 'lucide-react';
import './BusinessPreviewPage.css';

const packages = [
  { title: '세미나·컨퍼런스', en: 'SEMINAR & CONFERENCE', desc: '전달할 메시지에 집중할 수 있도록.', count: '30–200명', items: ['음향·마이크', '스크린·영상', '등록 데스크', '다과·케이터링', '현장 운영'], image: '/hero-poster.jpg', note: '발표 세션, 참석자 동선, 등록 운영까지 함께 설계합니다.' },
  { title: '기념식·시상식', en: 'CEREMONY & AWARDS', desc: '회사의 중요한 순간을 더 특별하게.', count: '50–300명', items: ['무대·조명', '행사 사회자', '현수막·연출', '시상 동선', '현장 운영'], image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85', note: '식순, 무대 연출, 리허설을 하나의 흐름으로 준비합니다.' },
  { title: '워크숍·팀빌딩', en: 'WORKSHOP & TEAM BUILDING', desc: '함께하는 시간이 팀의 에너지가 되도록.', count: '20–100명', items: ['장소 섭외', '팀빌딩 프로그램', '식사·다과', '진행 인력', '이동 계획'], image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=85', note: '행사 목적과 참여자의 특성에 맞는 프로그램을 구성합니다.' },
];
const faqs = [
  ['날짜나 예산이 아직 정해지지 않았어요.', '괜찮습니다. 행사 목적과 대략적인 규모부터 정리해 보세요. 상담 단계에서 일정·장소·예산을 미정으로 선택할 수 있도록 구성했습니다.'],
  ['전체 대행이 아니라 장비나 인력만 필요해요.', '필요한 항목만 선택하는 방식으로 상담할 수 있습니다. 음향, 영상, 케이터링, 운영 인력 등 필요한 범위를 알려주세요.'],
  ['견적에는 어떤 비용이 포함되나요?', '실제 견적에서는 장비, 인력, 운송, 설치·철수 비용과 부가세를 구분하고, 장소와 운영 시간에 따른 추가 비용을 확인하는 구성을 제안합니다.'],
];

export default function BusinessPreviewPage() {
  const [selected, setSelected] = useState(0);
  const [pax, setPax] = useState('50–100명');
  const [budget, setBudget] = useState('예산 미정');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const current = packages[selected];
  const choose = (index: number) => { setSelected(index); setSubmitted(false); document.getElementById('bp-planner')?.scrollIntoView({ behavior: 'smooth' }); };
  const download = () => {
    const content = `행사어때 | 행사 준비 체크리스트\r\n\r\n□ 행사 목적과 참석 대상 정하기\r\n□ 예상 인원과 예산 범위 정하기\r\n□ 날짜와 장소 후보 확인하기\r\n□ 장비·인력·식음료 필요 범위 정하기\r\n□ 운송·설치·철수 및 부가세 확인하기\r\n□ 식순과 리허설 일정 정하기\r\n□ 현장 담당자와 비상 연락망 정리하기\r\n\r\n선택한 행사: ${current.title}\r\n예상 인원: ${pax}\r\n예산: ${budget}\r\n\r\n검토용 자료이며 확정 견적이 아닙니다.`;
    const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = '행사어때_행사준비_체크리스트.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="bp">
    <Helmet><title>기업 행사 제안 | 행사어때 테스트 페이지</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <div className="bp-preview"><span><i /> DESIGN PREVIEW · 기업 고객용 테스트 페이지</span><a href="/">기존 홈페이지 보기 <ArrowUpRight size={13} /></a></div>
    <header className="bp-header bp-wrap"><a href="#" className="bp-logo">행사어때<span>BUSINESS</span></a><nav aria-label="테스트 페이지 메뉴"><a href="#bp-packages">행사별 구성</a><a href="#bp-stories">운영 이야기</a><a href="#bp-guide">준비 가이드</a></nav><a className="bp-header-cta" href="#bp-planner">우리 행사 시작하기 <ArrowUpRight size={16} /></a></header>
    <main>
      <section className="bp-hero bp-wrap">
        <div className="bp-hero-copy"><p className="bp-eyebrow"><span /> 대전·충청 기업 행사 파트너</p><h1>행사 준비의 막막함을,<br /><em>잘 끝냈다는 안도감으로.</em></h1><p className="bp-lead">예산을 정하는 순간부터 마지막 참석자가 돌아갈 때까지.<br className="bp-desktop" /> 우리 회사에 맞는 행사를 행사어때와 함께 준비하세요.</p><div className="bp-actions"><a className="bp-button bp-primary" href="#bp-packages">우리 행사에 맞는 구성 찾기 <ArrowRight size={18} /></a><a className="bp-text-link" href="#bp-stories">어떻게 준비하나요? <ArrowUpRight size={17} /></a></div><div className="bp-hero-foot"><span><Check size={15} /> 필요한 서비스만 선택</span><span><Check size={15} /> 일정·예산 미정도 OK</span></div></div>
        <div className="bp-hero-image"><img src="/hero-poster.jpg" alt="행사 공간과 무대 전경" fetchPriority="high" /><div className="bp-image-shade" /><span className="bp-image-label">FROM PLAN TO EXPERIENCE</span><div className="bp-image-caption"><span>준비는 빈틈없이.<br />기억은 오래도록.</span><span className="bp-round-arrow"><ArrowUpRight size={28} /></span></div><div className="bp-floating"><span className="bp-floating-icon"><ClipboardList size={23} /></span><div><strong>담당자의 할 일은 더 가볍게</strong><p>기획 · 공간 · 장비 · 현장 운영</p></div></div></div>
      </section>
      <div className="bp-principles bp-wrap"><p>행사 담당자에게 필요한 건<br /><strong>더 많은 선택지보다, 명확한 방향.</strong></p><span><b>01</b> 목적에 맞는 행사 구성</span><span><b>02</b> 포함 범위가 보이는 견적</span><span><b>03</b> 설치부터 철수까지의 계획</span></div>
      <section id="bp-packages" className="bp-section bp-wrap"><div className="bp-section-heading"><div><p className="bp-eyebrow">FIND YOUR EVENT</p><h2>어떤 행사를 준비하고 계신가요?</h2><p>처음부터 하나씩 찾지 않아도 괜찮아요. 목적에 맞는 구성에서 시작하세요.</p></div><span className="bp-small-note">아래는 상담을 위한 구성 예시입니다.</span></div><div className="bp-package-grid">{packages.map((pack, i) => <article className="bp-package" key={pack.title}><div className="bp-package-image"><img src={pack.image} alt={`${pack.title} 분위기 참고 이미지`} loading="lazy" /><span>{pack.count} 구성 예시</span></div><div className="bp-package-body"><p className="bp-mini">{pack.en}</p><h3>{pack.title}</h3><p>{pack.desc}</p><div className="bp-tags">{pack.items.map(item => <span key={item}>{item}</span>)}</div><button onClick={() => choose(i)}>이 구성으로 시작하기 <ArrowUpRight size={19} /></button></div></article>)}</div></section>
      <section id="bp-planner" className="bp-planner-section"><div className="bp-wrap bp-planner"><div><p className="bp-eyebrow">A CLEAR START</p><h2>우리 행사에 필요한 것만,<br />간단하게 정리해 보세요.</h2><p className="bp-planner-desc">아직 확정된 계획이 없어도 됩니다.<br />선택한 내용을 바탕으로 상담의 첫 페이지를 만들어 보세요.</p><div className="bp-planner-tip"><ClipboardList size={21} /><p>검토용 체험입니다.<br /><strong>정보 입력이나 실제 상담 접수 없이 확인하세요.</strong></p></div></div><form className="bp-planner-card" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}><div className="bp-form-heading"><h3>나의 행사 구성</h3><span>QUICK PLANNER</span></div><label htmlFor="bp-type">어떤 행사인가요?</label><select id="bp-type" value={selected} onChange={e => { setSelected(Number(e.target.value)); setSubmitted(false); }}>{packages.map((pack, i) => <option key={pack.title} value={i}>{pack.title}</option>)}</select><div className="bp-form-row"><div><label htmlFor="bp-pax">예상 참석 인원</label><select id="bp-pax" value={pax} onChange={e => { setPax(e.target.value); setSubmitted(false); }}>{['인원 미정', '30명 이하', '30–50명', '50–100명', '100–200명', '200명 이상'].map(v => <option key={v}>{v}</option>)}</select></div><div><label htmlFor="bp-budget">예산 범위</label><select id="bp-budget" value={budget} onChange={e => { setBudget(e.target.value); setSubmitted(false); }}>{['예산 미정', '300만원 이하', '300–500만원', '500–1,000만원', '1,000만원 이상'].map(v => <option key={v}>{v}</option>)}</select></div></div><div className="bp-recommend"><span>추천 준비 항목</span><p>{current.items.join(' · ')}</p></div><button className="bp-button bp-primary" type="submit">상담 내용 미리보기 <ArrowRight size={18} /></button>{submitted && <div className="bp-result" role="status"><strong><Check size={17} /> 상담 준비 내용이 정리되었어요.</strong><p>{current.title} / {pax} / {budget}</p><p>{current.note}</p><small>테스트 화면으로 실제 상담은 접수되지 않았습니다.</small></div>}</form></div></section>
      <section id="bp-stories" className="bp-section bp-wrap"><div className="bp-section-heading"><div><p className="bp-eyebrow">BEHIND THE EVENT</p><h2>사진 너머, 준비 과정까지 보여드립니다.</h2><p>기업 담당자가 궁금한 규모와 운영 범위를 한눈에.</p></div><span className="bp-small-note">콘텐츠 배치 예시 · 실제 수행 실적이 아닙니다.</span></div><div className="bp-story"><div className="bp-story-image"><img src="/hero-poster.jpg" alt="세미나 운영 사례 배치용 참고 이미지" loading="lazy" /><span>예시 시나리오</span></div><div className="bp-story-copy"><p className="bp-eyebrow">SEMINAR · DAEJEON</p><h3>발표자는 발표에,<br />담당자는 참석자에게 집중하도록.</h3><p>100명 규모 기업 세미나를 가정한 운영 제안입니다. 등록부터 발표, 휴식 시간까지 끊김 없는 흐름을 설계합니다.</p><dl><div><dt>행사 규모</dt><dd>100명 · 반일 행사</dd></div><div><dt>준비 범위</dt><dd>음향·영상 / 등록 / 다과 / 운영</dd></div><div><dt>핵심 체크</dt><dd>사전 리허설과 참석자 동선 분리</dd></div></dl><button className="bp-text-link" onClick={() => choose(0)}>비슷한 행사 구성해 보기 <ArrowUpRight size={18} /></button></div></div></section>
      <section id="bp-guide" className="bp-guide bp-wrap"><div className="bp-guide-icon"><ClipboardList size={38} strokeWidth={1.4} /></div><div><p className="bp-eyebrow">FOR YOUR NEXT EVENT</p><h2>첫 행사 담당자를 위한 준비 체크리스트</h2><p>예산, 장소, 장비, 진행 순서. 놓치기 쉬운 준비 항목을 챙겨 가세요.</p></div><button className="bp-button bp-outline" onClick={download}>체크리스트 받기 <Download size={17} /></button></section>
      <section className="bp-section bp-wrap bp-faq"><div><p className="bp-eyebrow">GOOD TO KNOW</p><h2>시작하기 전,<br />궁금한 것들.</h2></div><div>{faqs.map(([question, answer], i) => <div className="bp-faq-item" key={question}><button aria-expanded={openFaq === i} aria-controls={`bp-answer-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>{question}{openFaq === i ? <Minus size={18} /> : <Plus size={18} />}</button><p id={`bp-answer-${i}`} hidden={openFaq !== i}>{answer}</p></div>)}</div></section>
      <section className="bp-bottom"><div className="bp-wrap"><p>다음 행사는, 조금 더 가볍게 시작하세요.</p><h2>좋은 행사의 시작을 함께합니다.</h2><a href="#bp-planner" className="bp-button">우리 행사 구성해 보기 <ArrowUpRight size={19} /></a></div></section>
    </main><footer className="bp-wrap bp-footer"><a className="bp-logo" href="#">행사어때<span>BUSINESS</span></a><p><MapPin size={14} /> 대전·충청 기업 행사 파트너</p><span>검토용 테스트 페이지 · 실제 상담 접수 없음</span></footer>
  </div>;
}
