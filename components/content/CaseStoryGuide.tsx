import React, { useId, useState } from 'react';
import { CASE_STORY_FIELDS, buildCaseStory, buildCaseSummary, readCaseStory } from '../../src/utils/caseStory';

export const CaseStoryGuide = ({ initialContent = '', onApply }: { initialContent?: string; onApply: (html: string, summary: string) => void }) => {
  const prefix = useId();
  const [story, setStory] = useState(() => readCaseStory(initialContent));
  const [hasApplied, setHasApplied] = useState(() => Object.values(readCaseStory(initialContent)).some(Boolean));
  const [message, setMessage] = useState('');
  const html = buildCaseStory(story);
  const filledCount = CASE_STORY_FIELDS.filter(field => story[field.key].trim()).length;
  return (
    <details className="mb-5 rounded-xl border border-green-200 bg-green-50/50 p-4 sm:p-5">
      <summary className="cursor-pointer text-base font-bold text-slate-900">현장사례 작성 도우미 <span className="ml-1 text-sm font-medium text-slate-500">{filledCount}/6 항목</span></summary>
      <a href="/guides/business-trust-writing.md" download className="mt-3 inline-block text-sm font-semibold text-green-800 underline">사례·운영·견적 작성 가이드 다운로드</a>
      <p className="mb-5 mt-3 text-sm leading-6 text-slate-600">문구를 수정할 때는 아래 입력칸에서 고친 뒤 다시 반영하세요. 작성 도우미가 만든 부분만 교체되고, 본문의 다른 영역에 추가한 사진과 글은 유지됩니다. 실제 게시하려면 페이지의 저장 버튼을 눌러주세요.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {CASE_STORY_FIELDS.map(field => (
          <div key={field.key}>
            <label htmlFor={`${prefix}-${field.key}`} className="mb-1 block text-sm font-bold text-slate-800">{field.label}</label>
            <p id={`${prefix}-${field.key}-hint`} className="mb-2 text-xs leading-5 text-slate-500">{field.hint}</p>
            <textarea id={`${prefix}-${field.key}`} aria-describedby={`${prefix}-${field.key}-hint`} rows={4}
              value={story[field.key]} onChange={event => { setStory(prev => ({ ...prev, [field.key]: event.target.value })); setMessage(''); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">사진은 본문 편집기에서 추가하세요. 전체 전경 → 담당한 설치·장비 → 운영 과정 순으로 3~5장을 권장합니다. 고객명·로고·참가자 얼굴은 공개 가능한 자료만 사용하세요.</p>
      <button type="button" disabled={!html} onClick={() => {
        onApply(html, buildCaseSummary(story)); setHasApplied(true); setMessage('작성 내용을 본문에 반영했습니다. 사진과 문구를 확인한 뒤 저장해주세요.');
      }} className="mt-4 rounded-lg bg-green-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{hasApplied ? '수정 내용 다시 반영' : '작성 내용을 본문에 반영'}</button>
      <p role="status" className="mt-2 text-sm text-green-800">{message}</p>
    </details>
  );
};
