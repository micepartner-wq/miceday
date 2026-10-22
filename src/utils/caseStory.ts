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

export function buildCaseStory(story: CaseStory) {
  return CASE_STORY_FIELDS.filter(field => story[field.key].trim()).map(field =>
    `<h2>${field.label}</h2><p>${escapeHtml(story[field.key].trim()).replace(/\n/g, '<br>')}</p>`
  ).join('\n');
}

export function buildCaseSummary(story: CaseStory) {
  return [story.overview.trim(), story.scope.trim()].filter(Boolean).join(' · ').replace(/\s+/g, ' ').slice(0, 140);
}
