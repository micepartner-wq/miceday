export const REFERRAL_SOURCES = ['네이버', '구글', '블로그', '지인', '기타'] as const;

export interface QuoteValidationInput {
  referralSource: string;
  referralSourceOther: string;
  managerName: string;
  phone: string;
  email: string;
  organization: string;
  date: string;
  isDateUndecided?: boolean;
  location: string;
  isLocationUndecided?: boolean;
  pax: string;
  isPaxUndecided?: boolean;
  budgetRange: string;
  customBudget: string;
  services: string[];
}

export function getQuoteErrors(data: QuoteValidationInput, quick: boolean, step: number): string[] {
  const errors: string[] = [];
  if (!REFERRAL_SOURCES.some(source => source === data.referralSource)) errors.push('유입경로를 선택해주세요.');
  if (data.referralSource === '기타' && !data.referralSourceOther.trim()) errors.push('기타 유입경로를 입력해주세요.');
  if (!data.managerName.trim()) errors.push('담당자 성함을 입력해주세요.');
  if (!/^01\d{8,9}$/.test(data.phone.replace(/\D/g, ''))) errors.push('휴대폰 번호를 확인해주세요.');
  if ((!quick && !data.email.trim()) || (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))) errors.push('올바른 이메일 주소를 입력해주세요.');
  if (!quick) {
    if (!data.organization.trim()) errors.push('소속 기업 또는 단체명을 입력해주세요.');
    if (!data.isDateUndecided) {
      const dates = data.date.split(' ~ ');
      if (dates.length !== 2 || !dates.every(date => /^\d{4}\.\d{2}\.\d{2}$/.test(date)) || dates[0] > dates[1]) errors.push('시작일과 종료일을 선택하거나 예정일 미정을 체크해주세요.');
    }
    if (!data.isLocationUndecided && !data.location.trim()) errors.push('행사 장소를 입력하거나 미정을 체크해주세요.');
    if (!data.isPaxUndecided && !(Number(data.pax) > 0)) errors.push('예상 인원을 입력하거나 미정을 체크해주세요.');
    if (!data.budgetRange || (data.budgetRange === '기타' && !(Number(data.customBudget.replace(/,/g, '')) > 0))) errors.push('예산을 선택해주세요. 아직 정해지지 않았다면 미정을 선택할 수 있습니다.');
    if (step >= 2 && data.services.length === 0) errors.push('필요한 서비스 또는 전체 기획 상담을 선택해주세요.');
  }
  return errors;
}
