export const CASE_STORY_FIELDS = [
  { key: 'overview', label: '행사 개요', hint: '행사 종류 · 진행 시기 · 지역/장소 · 참석 규모' },
  { key: 'request', label: '고객의 요청과 과제', hint: '고객이 중요하게 여긴 조건이나 준비 중 어려웠던 점' },
  { key: 'scope', label: '행사어때의 담당 범위', hint: '실제 맡은 업무만 작성: 기획, 대관, 무대, 음향, 등록, 인력 등' },
  { key: 'preparation', label: '준비와 해결 과정', hint: '어떤 배치·일정·장비·진행 방식을 선택했는지와 그 이유' },
  { key: 'operation', label: '현장 운영', hint: '실제 실시한 설치, 점검, 리허설, 진행, 철수 과정' },
  { key: 'result', label: '결과와 고객 피드백', hint: '확인된 결과 또는 공개 허락을 받은 실제 후기. 없으면 비워두세요.' },
] as const;

export type CaseStory = Record<(typeof CASE_STORY_FIELDS)[number]['key'], string>;
export const emptyCaseStory = (): CaseStory => ({ overview: '', request: '', scope: '', preparation: '', operation: '', result: '' });
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
const headingStyle = 'margin:28px 0 12px;padding:10px 14px;border-left:4px solid #39B54A;background:#f8fafc;color:#0f172a;font-size:18px;font-weight:700;line-height:1.5;';
const bodyStyle = 'margin:0 0 24px;padding:0;border:0;background:transparent;color:#334155;font-size:16px;font-weight:400;line-height:1.8;';

export function buildCaseStory(story: CaseStory) {
  const sections = CASE_STORY_FIELDS.filter(field => story[field.key].trim()).map(field =>
    `<div data-case-story-field="${field.key}"><h3 class="case-story-heading" style="${headingStyle}">${field.label}</h3><p data-case-story-body="true" style="${bodyStyle}">${escapeHtml(story[field.key].trim()).replace(/\n/g, '<br>')}</p></div>`
  );
  return sections.length ? `<div data-case-story="true">${sections.join('')}</div>` : '';
}

export function buildCaseSummary(story: CaseStory) {
  return [story.overview.trim(), story.scope.trim()].filter(Boolean).join(' · ').replace(/\s+/g, ' ').slice(0, 140);
}

const getRoot = (html: string) => {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
};

const getTextWithLineBreaks = (element: Element | null) => {
  if (!element) return '';
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  return (copy.textContent || '').replace(/\u00a0/g, ' ').trim();
};

const getLegacyFields = (root: Element) =>
  Array.from(root.querySelectorAll('h2')).flatMap(heading => {
    const field = CASE_STORY_FIELDS.find(item => item.label === heading.textContent?.trim());
    const body = heading.nextElementSibling;
    return field && body?.tagName === 'P' ? [{ field, heading, body }] : [];
  });

export function readCaseStory(html: string): CaseStory {
  const story = emptyCaseStory();
  if (!html || typeof document === 'undefined') return story;

  const root = getRoot(html);
  const savedSections = root.querySelectorAll('[data-case-story-field]');
  if (savedSections.length) {
    savedSections.forEach(section => {
      const key = section.getAttribute('data-case-story-field') as keyof CaseStory;
      if (key in story) story[key] = getTextWithLineBreaks(section.querySelector('[data-case-story-body]'));
    });
    return story;
  }

  getLegacyFields(root).forEach(({ field, body }) => {
    story[field.key] = getTextWithLineBreaks(body);
  });
  return story;
}

export function upsertCaseStory(content: string, storyHtml: string): string {
  if (!storyHtml || typeof document === 'undefined') return content;

  const root = getRoot(content);
  const replacement = getRoot(storyHtml).firstElementChild;
  if (!replacement) return content;

  const savedStory = root.querySelector('[data-case-story]');
  if (savedStory) {
    savedStory.replaceWith(replacement);
  } else {
    const legacyFields = getLegacyFields(root);
    if (legacyFields.length) {
      legacyFields[0].heading.before(replacement);
      legacyFields.forEach(({ heading, body }) => {
        heading.remove();
        body.remove();
      });
    } else {
      root.append(replacement);
    }
  }

  return root.innerHTML;
}
