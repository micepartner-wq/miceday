import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { addInquiry } from '../src/api/inquiryApi';
import { sendInquiryNotificationEmail } from '../src/utils/email';
import { uploadImage } from '../src/api/storageApi';
import { useAuth } from '../src/context/AuthContext';
import { getQuoteErrors, REFERRAL_SOURCES } from '../src/utils/quoteValidation';
import { Calendar, ChevronRight, ChevronLeft, Check, CheckCircle2, BatteryCharging, Coffee, Megaphone, MonitorPlay, UploadCloud, Send, Layers, Palette, ClipboardList, CheckSquare, PenLine, Paperclip, X, MessageSquare, Mail, Phone, Briefcase, Award } from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale/ko";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "../src/styles/calendar.css";

registerLocale("ko", ko);

type ServiceType = 'stage' | 'booth' | 'power' | 'catering' | 'staff' | 'design' | 'planning';

interface QuoteForm {
  referralSource: string;
  referralSourceOther: string;
  organization: string;
  managerName: string;
  phone: string;
  email: string;
  comments: string;
  location: string;
  isLocationUndecided?: boolean;
  pax: string;
  isPaxUndecided?: boolean;
  budgetRange: string;
  customBudget: string;
  date: string;
  isDateUndecided: boolean;
  services: ServiceType[];
  budget?: string;
  cateringBudget?: string;
  powerLaptops?: string;
  files: File[];
}

export const SmartQuotePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const packageName = searchParams.get('package_name');
  const caseTitle = searchParams.get('case_title');
  const caseId = searchParams.get('case_id');
  const [step, setStep] = useState(1);
  const [isQuick, setIsQuick] = useState(!packageName);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submittedId, setSubmittedId] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const endDateRef = useRef<DatePicker>(null);
  const [formData, setFormData] = useState<QuoteForm>({
    referralSource: '',
    referralSourceOther: '',
    organization: '',
    managerName: '',
    phone: '',
    email: '',
    comments: '',
    location: '',
    isLocationUndecided: false,
    pax: '',
    isPaxUndecided: false,
    budgetRange: '',
    customBudget: '',
    date: '',
    isDateUndecided: false,
    services: [],
    files: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (validationErrors.length) errorRef.current?.focus();
  }, [validationErrors]);

  React.useEffect(() => {
    if (!isModalOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = modalRef.current;
    const buttons = dialog?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsModalOpen(false);
      if (event.key === 'Tab' && buttons?.length) {
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [isModalOpen]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.some(file => file.size > 10 * 1024 * 1024 || !/\.(pdf|jpe?g|png)$/i.test(file.name))) {
        setValidationErrors(['첨부파일은 PDF, JPG, PNG 형식으로 파일당 10MB 이하만 선택해주세요.']);
        e.target.value = '';
        return;
      }
      setFormData(prev => {
        const newFiles = [...prev.files, ...selectedFiles];
        if (newFiles.length > 5) {
          alert("파일은 최대 5개까지만 업로드 가능합니다.");
          return { ...prev, files: newFiles.slice(0, 5) };
        }
        return { ...prev, files: newFiles };
      });
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const toggleService = (service: ServiceType) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const validate = (targetStep: number) => {
    const errors = getQuoteErrors(formData, isQuick, targetStep);
    setValidationErrors(errors);
    return errors.length === 0;
  };
  const handleNext = () => { if (validate(step)) setStep(s => Math.min(3, s + 1)); };
  const handlePrev = () => { setValidationErrors([]); setStep(s => Math.max(1, s - 1)); };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(3)) return;
    setIsModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (submittingRef.current || !validate(3)) return;
    submittingRef.current = true;
    setIsModalOpen(false);
    setIsSubmitting(true);
    
    try {
      const dateText = isQuick || formData.isDateUndecided ? '미정' : formData.date;
      const budgetText = isQuick ? '미정' : formData.budgetRange === '기타' ? `${formData.customBudget}만원` : formData.budgetRange;
      const paxText = isQuick || formData.isPaxUndecided ? '미정' : `${formData.pax}명`;
      const locationText = isQuick || formData.isLocationUndecided ? '미정' : formData.location;
      const services = isQuick ? ['planning'] : formData.services;
      const title = `[${isQuick ? '간편상담' : '견적의뢰'}] ${formData.organization.trim() || formData.managerName.trim()}`;
      
      let fileLinks = '';
      if (formData.files.length > 0) {
        const uploadPromises = formData.files.map(async (file) => {
           const url = await uploadImage(file, 'inquiries');
           return `[다운로드] ${file.name} : ${url}`;
        });
        const uploadedFiles = await Promise.all(uploadPromises);
        fileLinks = `\n\n[첨부파일]\n${uploadedFiles.join('\n')}`;
      }
      
      const contentStr = `[스마트 견적 의뢰]
${caseTitle ? `■ 참고 사례: ${caseTitle}\n■ 사례 ID: ${caseId || ''}\n` : ''}
${packageName ? `■ 선택한 패키지: ${packageName}\n` : ''}■ 행사 예정일: ${dateText}
■ 연락처: ${formData.phone.trim()}
■ 유입경로: ${formData.referralSource === '기타' ? `기타 (${formData.referralSourceOther.trim()})` : formData.referralSource}
■ 행사 장소: ${locationText}
■ 예상 규모: ${paxText}
■ 예산 범위: ${budgetText}

===SERVICES_START===
${services.join('||')}
===SERVICES_END===${formData.comments.trim() ? `\n\n[추가 코멘트]\n${formData.comments.trim()}` : ''}${fileLinks}`;

      const inquiryId = await addInquiry({
        user_id: user ? user.uid : 'guest',
        user_name: formData.managerName,
        user_email: formData.email,
        company_name: formData.organization,
        category: 'quote',
        title,
        content: contentStr,
      });

      try {
        const SERVICES_MAP: Record<string, string> = {
            'stage': '무대 및 A/V 시스템',
            'booth': '공간 연출 및 부스',
            'power': 'IT 장비 및 전력망 구축',
            'catering': 'F&B 케이터링',
            'staff': '현장 운영 및 매니지먼트',
            'design': '홍보 및 디자인 인쇄물',
            'planning': '전체 기획부터 상담'
        };
        const mappedServices = services.map(s => SERVICES_MAP[s] || s);

        await sendInquiryNotificationEmail({
          inquiryId,
          title,
          requesterName: formData.managerName,
          companyName: formData.organization,
          phone: formData.phone,
          userEmail: formData.email,
          pax: paxText,
          budget: budgetText,
          location: locationText,
          date: dateText,
          services: mappedServices,
          content: contentStr.replace(/^■ 연락처:[^\r\n]*\r?\n/m, '')
        });
      } catch (emailError) {
        console.error('Failed to send inquiry notification email:', emailError);
      }

      setSubmittedId(inquiryId);
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit quote:', error);
      alert('견적 의뢰 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };


  const renderReferralSource = () => (
    <div>
      <label htmlFor="quote-referral-source" className="block text-sm font-bold text-gray-700 mb-2">유입경로 <span className="text-red-500">*</span></label>
      {formData.referralSource !== '기타' ? <div className="relative"><select id="quote-referral-source" aria-required="true" value={formData.referralSource}
        onChange={e => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
        className="w-full pl-4 pr-12 py-4 appearance-none bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:border-[#39B54A] outline-none">
        <option value="" disabled>유입경로를 선택해주세요</option>
        {REFERRAL_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
      </select><svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div> : (
        <div className="relative flex items-center gap-2 w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus-within:border-[#39B54A]">
        <span className="relative z-10 pointer-events-none shrink-0 text-gray-900">기타 :</span>
        <input
          id="quote-referral-source"
          type="text"
          autoFocus
          aria-label="기타 유입경로"
          aria-required="true"
          value={formData.referralSourceOther}
          onChange={e => setFormData(prev => ({ ...prev, referralSourceOther: e.target.value }))}
          placeholder="직접 입력"
          className={`relative z-10 min-w-0 bg-transparent text-gray-900 outline-none ${isQuick ? 'w-1/2 max-w-[240px] flex-none' : 'flex-1'}`}
        />
        <div className="pointer-events-none ml-auto shrink-0 w-5 h-5">
          <svg className="pointer-events-none w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
          <select
            aria-label="유입경로 다시 선택"
            value={formData.referralSource}
            onChange={e => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-sm"
          >
            <option value="" disabled>유입경로를 선택해주세요</option>
            {REFERRAL_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
          </select>
        </div>
      )}
    </div>
  );

  const renderMobileHorizontalStepIndicator = () => (
    <div className="flex min-[1650px]:hidden items-center justify-between w-full max-w-sm mx-auto mb-12 mt-2 px-2">
      {[1, 2, 3].map((s, idx) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center relative z-10 shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
              step >= s 
              ? 'border-2 border-[#39B54A] bg-[#39B54A] text-white shadow-lg shadow-[#39B54A]/30' 
              : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}>
              {step > s ? <Check className="w-6 h-6" /> : s}
            </div>
            <span className={`text-xs absolute -bottom-7 w-20 text-center font-bold transition-colors ${step >= s ? 'text-[#39B54A]' : 'text-slate-400'}`}>
              {s === 1 ? '기본 정보' : s === 2 ? '서비스 선택' : '제출'}
            </span>
          </div>
          {idx < 2 && (
            <div className="flex-1 h-1 mx-2 bg-slate-200 rounded-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full bg-[#39B54A] transition-all duration-500 rounded-full ${step > s ? 'w-full' : 'w-0'}`} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderDesktopVerticalStepIndicator = () => (
    <div className="hidden min-[1650px]:flex absolute top-16 -left-[8rem] 2xl:-left-[10rem] z-10 flex-col items-center w-24">
      {[1, 2, 3].map((s, idx) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center relative z-10 shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
              step >= s 
              ? 'border-2 border-[#39B54A] bg-[#39B54A] text-white shadow-lg shadow-[#39B54A]/30' 
              : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}>
              {step > s ? <Check className="w-6 h-6" /> : s}
            </div>
            <span className={`text-sm mt-3 font-extrabold whitespace-nowrap transition-colors duration-300 ${step >= s ? 'text-[#39B54A]' : 'text-slate-400'}`}>
              {s === 1 ? '기본 정보' : s === 2 ? '서비스 선택' : '제출'}
            </span>
          </div>
          {idx < 2 && (
            <div className="w-1 h-20 my-2 bg-slate-200 rounded-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full bg-[#39B54A] transition-all duration-500 rounded-full ${step > s ? 'h-full' : 'h-0'}`} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      <style>{`
        .smart-quote-calendar.react-datepicker {
          width: 350px !important;
          max-width: 350px !important;
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 1rem !important;
          padding: 1rem !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        }
        @media (max-width: 480px) {
          .smart-quote-calendar.react-datepicker {
            width: 280px !important;
            min-width: 280px !important;
            max-width: 280px !important;
            padding: 0.5rem !important;
          }
          .smart-quote-calendar .react-datepicker__month-container {
            width: 100% !important;
          }
          .smart-quote-calendar .react-datepicker__day-name, 
          .smart-quote-calendar .react-datepicker__day, 
          .smart-quote-calendar .react-datepicker__time-name {
            width: 1.8rem !important;
            line-height: 1.8rem !important;
            margin: 0.1rem !important;
            font-size: 0.85rem !important;
          }
        }
        .smart-quote-calendar .react-datepicker__header {
          padding-top: 0 !important;
          border-bottom: none !important;
        }
        .smart-quote-calendar .react-datepicker__month-container {
          width: 100% !important;
        }
      `}</style>
      <Seo title="견적 문의 | 행사어때" description="행사어때 스마트 견적 마법사를 통해 맞춤형 견적을 받아보세요." canonical="/contact" />
      <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50 selection:bg-[#39B54A]/30">
        
        {/* Left Side: Brand & Info (Dark Split) */}
        <div className={`hidden lg:flex w-full lg:w-[35%] xl:w-[30%] bg-slate-950 text-white relative overflow-hidden flex-col justify-start gap-12 lg:gap-16 xl:gap-20 p-8 pt-[60px] lg:p-12 xl:p-20 lg:pt-[80px] min-h-[50vh] lg:min-h-full transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform ${mounted ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/95"></div>

          <div className="relative z-10 flex flex-col items-center text-center lg:items-end lg:text-right mt-10 lg:mt-20">
            <div>
              <h1 className="text-3xl lg:text-2xl xl:text-4xl font-extrabold leading-[1.3] mb-6 tracking-tight break-keep lg:whitespace-nowrap xl:break-keep">
                성공적인 행사를 위한<br/>
                <span className="text-[#39B54A]">가장 완벽한 선택</span>
              </h1>
              <p className="text-slate-400 text-lg lg:text-base xl:text-lg leading-relaxed max-w-md break-keep">
                행사어때와 함께 비즈니스의 품격을 높이세요.
              </p>
              
              {/* 장애인기업 수의계약 뱃지 */}
              <div className="mt-12 flex justify-center lg:justify-end">
                <div className="flex items-center gap-3 bg-white/5 border border-white/40 px-5 py-4 lg:px-4 xl:px-5 rounded-2xl backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  <div className="text-right whitespace-nowrap">
                    <p className="text-xs text-[#39B54A] font-bold mb-1 tracking-wider">공공기관 우선구매 대상</p>
                    <p className="text-base lg:text-sm xl:text-base text-white font-extrabold tracking-tight">장애인기업 (수의계약 가능)</p>
                  </div>
                  <div className="w-12 h-12 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(57,181,74,0.4)] overflow-hidden border-2 border-[#39B54A]">
                    <img src="/cert-disabled.jpg" alt="장애인기업 로고" className="w-full h-full object-contain p-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden lg:flex flex-col items-end text-right space-y-8">
            <div>
              <p className="text-slate-500 font-bold tracking-widest text-xs mb-4 uppercase">Contact Information</p>
              <div className="space-y-4">
                <div className="flex items-start justify-end gap-3">
                  <div className="whitespace-nowrap">
                    <p className="text-xs text-slate-400/80 mb-0.5">고객센터</p>
                    <p className="text-lg lg:text-base xl:text-lg font-bold text-white/90 tracking-tight">1800-1985</p>
                  </div>
                  <div className="w-10 h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Phone size={16} className="text-[#39B54A]/80 xl:w-4 xl:h-4 w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-start justify-end gap-3">
                  <div className="whitespace-nowrap">
                    <p className="text-xs text-slate-400/80 mb-0.5">이메일</p>
                    <p className="text-base lg:text-sm xl:text-base font-medium text-white/90 tracking-tight">micepartner@micepartner.co.kr</p>
                  </div>
                  <div className="w-10 h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Mail size={16} className="text-[#39B54A]/80 xl:w-4 xl:h-4 w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-[65%] xl:w-[70%] bg-slate-50 p-6 pt-[30px] md:p-12 md:pt-[60px] lg:p-10 xl:p-20 lg:pt-[80px] flex items-start justify-center">
          <div className="w-full max-w-4xl flex flex-col relative">
            {!isQuick && !isSuccess && renderDesktopVerticalStepIndicator()}
            {!isQuick && !isSuccess && renderMobileHorizontalStepIndicator()}
            
            <div className={`w-full bg-white p-5 sm:p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-[1500ms] delay-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>

            {isSuccess ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-24 h-24 bg-[#39B54A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-[#39B54A]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">견적 의뢰가 성공적으로 접수되었습니다!</h2>
                <p className="mb-4 text-sm text-gray-600">접수번호: {submittedId.slice(0, 8).toUpperCase()}</p>
                <p className="text-gray-500 mb-10">
                  작성해주신 내용을 바탕으로 최적의 솔루션을 구성하고 있습니다.<br/>
                  영업일 기준 24시간 이내에 담당자가 연락드리겠습니다.
                </p>
                <button 
                  onClick={() => window.location.assign('/')}
                  className="bg-[#39B54A] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#2e933c] transition-colors shadow-lg shadow-[#39B54A]/20"
                >
                  메인으로 돌아가기
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={isQuick || step === 3 ? handleInitialSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                {caseTitle && <p className="mb-5 rounded-lg bg-green-50 p-4 text-sm leading-6 text-green-900">참고 사례: {caseTitle}</p>}
                <div className="mb-8">
                  <div className="grid grid-cols-2 gap-2" aria-label="문의 방식">
                    {[true, false].map(quick => (
                      <button key={String(quick)} type="button" aria-pressed={isQuick === quick}
                        onClick={() => { setIsQuick(quick); setStep(1); setValidationErrors([]); }}
                        className={`rounded-xl border px-3 py-3 text-sm font-bold ${isQuick === quick ? 'border-green-700 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600'}`}>
                        {quick ? '간편 상담' : '상세 견적'}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{isQuick ? '담당자 성함과 연락처만으로 상담을 시작할 수 있어요. 행사 종류와 궁금한 점은 아래에 적어주세요.' : '정해진 내용을 알려주세요. 일정·장소·인원·예산은 미정으로 선택할 수 있어요.'}</p>
                </div>
                {validationErrors.length > 0 && (
                  <div ref={errorRef} tabIndex={-1} role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <p className="font-bold">아래 내용을 확인해주세요.</p>
                    <ul className="mt-2 list-disc pl-5">{validationErrors.map(error => <li key={error}>{error}</li>)}</ul>
                  </div>
                )}


                {/* Step 1: 기본 정보 */}
                <div className={`transition-all duration-500 mt-4 ${step === 1 ? 'block animate-fade-in' : 'hidden'}`}>
                  <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center m-0 break-keep">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <ClipboardList className="w-5 h-5 text-gray-700" />
                      </span>
                      기본 정보 입력
                    </h3>
                    {packageName && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-full self-start md:self-auto animate-fade-in">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#39B54A]">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-[13px] font-medium text-gray-500 tracking-tight mt-0.5">
                          Selected
                        </span>
                        <div className="w-px h-3.5 bg-gray-200 mx-0.5"></div>
                        <span className="text-[14px] font-bold text-gray-900 tracking-tight mt-0.5">
                          {packageName}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="quote-organization" className="block text-sm font-bold text-gray-700 mb-2">소속(기업/단체명) {isQuick ? '(선택)' : <span className="text-red-500">*</span>}</label>
                        <div className="relative">
                          <input id="quote-organization" autoComplete="organization" type="text"
                            value={formData.organization}
                            onChange={(e) => setFormData(prev => ({...prev, organization: e.target.value}))}
                            placeholder="기업명 또는 단체명을 입력해주세요." 
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="quote-name" className="block text-sm font-bold text-gray-700 mb-2">담당자 성함 <span className="text-red-500">*</span></label>
                        <input id="quote-name" autoComplete="name" type="text"
                          value={formData.managerName}
                          onChange={(e) => setFormData(prev => ({...prev, managerName: e.target.value}))}
                          placeholder="담당자명을 입력해주세요." 
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400" />
                      </div>
                      <div>
                        <label htmlFor="quote-phone" className="block text-sm font-bold text-gray-700 mb-2">연락처(휴대폰) <span className="text-red-500">*</span></label>
                        <input id="quote-phone" autoComplete="tel" type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length > 11) val = val.slice(0, 11);
                            let formatted = val;
                            if (val.length > 3 && val.length <= 7) {
                              formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                            } else if (val.length > 7) {
                              formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`;
                            }
                            setFormData(prev => ({...prev, phone: formatted}));
                          }}
                          placeholder="연락처를 입력해주세요." 
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400" />
                      </div>
                      <div>
                        <label htmlFor="quote-email" className="block text-sm font-bold text-gray-700 mb-2">이메일 {isQuick ? '(선택)' : <span className="text-red-500">*</span>}</label>
                        <input id="quote-email" autoComplete="email" type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                          placeholder="example@email.com" 
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400" />
                      </div>
                    </div>

                    {isQuick && renderReferralSource()}
                    <div className={isQuick ? 'hidden' : 'space-y-8'}>
                    <hr className="border-gray-100" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <label htmlFor="quote-start-date" className="text-sm font-bold text-gray-700">행사 예정일 <span className="text-red-500">*</span></label>
                          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-gray-600">
                            <input type="checkbox" checked={formData.isDateUndecided}
                              onChange={e => {
                                const checked = e.target.checked;
                                setDateRange([null, null]);
                                setFormData(prev => ({ ...prev, isDateUndecided: checked, date: '' }));
                              }} className="h-4 w-4 accent-green-700" />
                            미정
                          </label>
                        </div>
                      <div className="flex items-center gap-2">
                        <div className="relative w-full z-50">
                          <DatePicker
                            id="quote-start-date"
                            disabled={formData.isDateUndecided}
                            selected={startDate}
                            onChange={(date: Date | null) => {
                              const nextEndDate = date && endDate && endDate < date ? null : endDate;
                              setDateRange([date, nextEndDate]);
                              if (date && nextEndDate) {
                                setFormData(prev => ({...prev, date: `${format(date, 'yyyy.MM.dd')} ~ ${format(nextEndDate, 'yyyy.MM.dd')}`}));
                              } else {
                                setFormData(prev => ({...prev, date: ''}));
                              }
                              if (date && endDateRef.current) {
                                endDateRef.current.setFocus();
                              }
                            }}
                            minDate={new Date()}
                            monthsShown={1}
                            dateFormat="yyyy.MM.dd"
                            locale="ko"
                            placeholderText={formData.isDateUndecided ? '일정 미정' : '시작일 선택'}
                            popperPlacement="bottom-start"
                            className="w-full pr-1 sm:pr-4 py-4 pl-8 sm:pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-[13px] sm:text-sm tracking-tighter sm:tracking-normal focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400 cursor-pointer"
                            popperClassName="z-[9999]"
                            calendarClassName="smart-quote-calendar"
                          />
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <span className="text-gray-400 font-bold">~</span>
                        <div className="relative w-full z-50">
                          <DatePicker
                            ariaLabelledBy="quote-end-label"
                            disabled={formData.isDateUndecided}
                            ref={endDateRef}
                            selected={endDate}
                            minDate={startDate || new Date()}
                            onChange={(date: Date | null) => {
                              setDateRange([startDate, date]);
                              if (startDate && date) {
                                setFormData(prev => ({...prev, date: `${format(startDate, 'yyyy.MM.dd')} ~ ${format(date, 'yyyy.MM.dd')}`}));
                              } else {
                                setFormData(prev => ({...prev, date: ''}));
                              }
                            }}
                            monthsShown={1}
                            dateFormat="yyyy.MM.dd"
                            locale="ko"
                            placeholderText={formData.isDateUndecided ? '일정 미정' : '종료일 선택'}
                            popperPlacement="bottom-end"
                            className="w-full pr-1 sm:pr-4 py-4 pl-8 sm:pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-[13px] sm:text-sm tracking-tighter sm:tracking-normal focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400 cursor-pointer"
                            popperClassName="z-[9999]"
                            calendarClassName="smart-quote-calendar"
                          />
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <span id="quote-end-label" className="sr-only">행사 종료일</span>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-gray-700 flex items-center">
                          행사 장소 (지역) <span className="text-red-500 ml-1">*</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={formData.isLocationUndecided}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev, 
                                isLocationUndecided: e.target.checked,
                                location: e.target.checked ? '' : prev.location
                              }));
                            }}
                            className="w-4 h-4 text-[#39B54A] bg-gray-100 border-gray-300 rounded focus:ring-[#39B54A] cursor-pointer" 
                          />
                          <span className="ml-2 text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">미정</span>
                        </label>
                      </div>
                      <input type="text" 
                        aria-label="행사 장소"
                        value={formData.location}
                        disabled={formData.isLocationUndecided}
                        onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                        placeholder={formData.isLocationUndecided ? "장소 미정" : "장소를 입력해주세요."} 
                        className={`w-full px-5 py-4 border rounded-xl text-sm outline-none transition-all ${
                          formData.isLocationUndecided 
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] placeholder-gray-400'
                        }`} />
                    </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-bold text-gray-700 flex items-center">
                            규모 인원
                          </label>
                        <label className="flex items-center cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={formData.isPaxUndecided}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev, 
                                isPaxUndecided: e.target.checked,
                                pax: e.target.checked ? '' : prev.pax
                              }));
                            }}
                            className="w-4 h-4 text-[#39B54A] bg-gray-100 border-gray-300 rounded focus:ring-[#39B54A] cursor-pointer" 
                          />
                          <span className="ml-2 text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">미정</span>
                        </label>
                      </div>
                      <div className="relative">
                        <input type="text" 
                          aria-label="예상 인원"
                          inputMode="numeric"
                          value={formData.pax}
                          disabled={formData.isPaxUndecided}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length > 6) val = val.slice(0, 6);
                            setFormData(prev => ({...prev, pax: val}));
                          }}
                          placeholder={formData.isPaxUndecided ? "인원 미정" : "대략 인원"}
                          className={`w-full px-5 py-4 pr-12 border rounded-xl text-sm outline-none transition-all ${
                            formData.isPaxUndecided 
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] placeholder-gray-400'
                          }`} />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm ${formData.pax && !formData.isPaxUndecided ? 'block' : 'hidden'}`}>명</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-gray-700 flex items-center">
                          예산 범위 <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                      <div className="relative flex gap-2">
                        <div className={`relative ${formData.budgetRange === '기타' ? 'w-1/2' : 'w-full'}`}>
                          <select 
                            aria-label="예산 범위"
                            value={formData.budgetRange}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev, 
                                budgetRange: e.target.value, 
                                customBudget: e.target.value === '기타' ? prev.customBudget : ''
                              }));
                            }}
                            className={`w-full px-5 py-4 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] cursor-pointer appearance-none bg-white ${
                              formData.budgetRange === '' ? 'text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            <option value="" disabled>선택</option>
                            <option value="미정" className="text-gray-900">미정</option>
                            <option value="500만원" className="text-gray-900">500만원</option>
                            <option value="1000만원" className="text-gray-900">1,000만원</option>
                            <option value="3000만원" className="text-gray-900">3,000만원</option>
                            <option value="5000만원" className="text-gray-900">5,000만원</option>
                            <option value="기타" className="text-gray-900">기타 (직접 입력)</option>
                          </select>
                          <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                        
                        {formData.budgetRange === '기타' && (
                          <div className="relative w-1/2 animate-fade-in">
                            <input type="text" 
                              aria-label="직접 입력 예산 (만원)"
                              inputMode="numeric"
                              value={formData.customBudget}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                if(val) val = parseInt(val, 10).toLocaleString('ko-KR');
                                setFormData(prev => ({...prev, customBudget: val}));
                              }}
                              placeholder="직접 입력" 
                              className="w-full px-5 py-4 pr-12 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 text-sm focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400" />
                            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm ${formData.customBudget ? 'block' : 'hidden'}`}>만원</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>{renderReferralSource()}</div>
                    </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: 서비스 선택 */}
                <div className={`transition-all duration-500 mt-4 ${step === 2 ? 'block animate-fade-in' : 'hidden'}`}>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 sm:mb-12 flex items-start md:items-center break-keep">
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 mt-0.5 md:mt-0">
                      <CheckSquare className="w-5 h-5 text-gray-700" />
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 leading-tight md:leading-normal">
                      <span>어떤 서비스가 필요하신가요?</span>
                      <span className="text-[13px] sm:text-2xl text-gray-500 font-medium sm:font-bold sm:text-gray-900">(다중 선택 가능)</span>
                    </div>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'planning', title: '전체 기획부터 상담', desc: '필요한 서비스가 정해지지 않아도 괜찮아요', icon: MessageSquare },
                      { id: 'stage', title: '무대 및 A/V 시스템', desc: '조명, 음향, 대형 LED, 무대 렌탈', icon: MonitorPlay },
                      { id: 'booth', title: '공간 연출 및 부스', desc: '옥타/트러스 부스, 현수막, 가구 렌탈', icon: Layers },
                      { id: 'power', title: 'IT 장비 및 전력망 구축', desc: '대규모 노트북 대여, 멀티탭 셋팅, 배선 몰딩', icon: BatteryCharging },
                      { id: 'catering', title: 'F&B 케이터링', desc: '예산 맞춤 간식, 음료, 냉장고 렌탈', icon: Coffee },
                      { id: 'staff', title: '현장 운영 및 매니지먼트', desc: '스태프 상주, 시상품 대행, 사후 청소', icon: Megaphone },
                      { id: 'design', title: '홍보 및 디자인 인쇄물', desc: '현수막, 배너, 포스터, 네임택, 굿즈 제작', icon: Palette },
                    ].map((svc) => (
                      <button type="button" aria-pressed={formData.services.includes(svc.id as ServiceType)}
                        key={svc.id}
                        onClick={() => toggleService(svc.id as ServiceType)}
                        className={`text-left cursor-pointer border-2 p-4 sm:p-5 rounded-2xl flex items-center transition-all duration-300 ${
                          formData.services.includes(svc.id as ServiceType) 
                          ? 'border-[#39B54A] bg-[#39B54A]/5 shadow-md shadow-[#39B54A]/10' 
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2.5 sm:p-3 mr-3 sm:mr-4 shrink-0 rounded-xl ${formData.services.includes(svc.id as ServiceType) ? 'bg-white text-[#39B54A] shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                          <svc.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`font-bold text-[15px] sm:text-lg mb-0.5 sm:mb-1 truncate ${formData.services.includes(svc.id as ServiceType) ? 'text-gray-900' : 'text-gray-700'}`}>{svc.title}</h4>
                          <p className="text-[12px] sm:text-sm text-gray-500 break-keep leading-tight sm:leading-normal">{svc.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: 추가 코멘트 및 파일 첨부 */}
                <div className={`transition-all duration-500 mt-4 ${isQuick || step === 3 ? 'block animate-fade-in' : 'hidden'}`}>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-8 sm:mb-12 flex items-start md:items-center break-keep">
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 mt-0.5 md:mt-0">
                      <MessageSquare className="w-5 h-5 text-gray-700" />
                    </span>
                    <span className="leading-snug md:leading-normal">요청 사항이나 참고 자료가 있다면 첨부해주세요!</span>
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="bg-white">
                      <label htmlFor="quote-comments" className="block text-sm font-bold text-gray-700 mb-2">추가 코멘트 (자유 기재)</label>
                      <textarea 
                        id="quote-comments"
                        value={formData.comments}
                        onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                        rows={4} 
                        placeholder="행사 성격, 예상 인원, 필요 장비, 요청 사항 등 자세한 내용을 자유롭게 작성해주시면 더욱 정확하고 빠른 견적 산출 및 행사 니즈 파악이 가능합니다." 
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-[13px] sm:text-base leading-relaxed focus:border-[#39B54A] focus:ring-1 focus:ring-[#39B54A] outline-none transition-all placeholder-gray-400 resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">참고 문서 첨부 (선택)</label>
                      <div 
                        role="button"
                        tabIndex={0}
                        aria-label="참고 문서 첨부"
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-6 md:p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-[#39B54A] transition-all cursor-pointer mb-6"
                      >
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                          <UploadCloud className="w-8 h-8 text-[#39B54A]" />
                        </div>
                        <span className="font-bold text-gray-700 mb-1 break-keep text-center">클릭하여 파일 업로드</span>
                        <span className="text-sm text-gray-500 break-keep text-center">PDF, JPG, PNG 파일 지원 (최대 10MB)</span>
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>

                      {formData.files.length > 0 && (
                        <div className="space-y-3 mt-6">
                          <h4 className="font-bold text-gray-900 text-sm mb-2 px-1">첨부된 파일 ({formData.files.length}개)</h4>
                          {formData.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl">
                              <div className="flex items-center">
                                <Paperclip className="w-5 h-5 text-[#39B54A] mr-3" />
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] sm:max-w-[400px]">{file.name}</span>
                                <span className="text-xs text-gray-400 ml-3 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <button 
                                type="button" 
                                aria-label={`${file.name} 첨부 삭제`}
                                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100 gap-2 pb-10 md:pb-0">
                  <button 
                    type="button"
                    onClick={handlePrev}
                    className={`flex items-center justify-center px-3 sm:px-6 py-3 font-bold text-gray-500 hover:text-gray-900 transition-colors break-keep whitespace-nowrap ${isQuick ? 'hidden' : step === 1 ? 'invisible' : 'visible'}`}
                  >
                    <ChevronLeft className="w-5 h-5 mr-1 shrink-0" /> <span className="hidden sm:inline">이전 단계</span><span className="sm:hidden">이전</span>
                  </button>
                  
                  {!isQuick && step < 3 ? (
                    <button 
                      type="button"
                      onClick={handleNext}
                      className="flex items-center justify-center bg-gray-900 text-white px-5 sm:px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed break-keep whitespace-nowrap"
                    >
                      다음 단계 <ChevronRight className="w-5 h-5 ml-1 shrink-0" />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleInitialSubmit}
                      disabled={isSubmitting}
                      className="flex items-center justify-center bg-[#39B54A] text-white px-5 sm:px-8 py-3 rounded-xl font-bold hover:bg-[#2e933c] transition-colors shadow-lg shadow-[#39B54A]/20 disabled:opacity-50 break-keep whitespace-nowrap"
                    >
                      {isSubmitting ? '처리 중...' : (
                        <>{isQuick ? '상담 요청하기' : '견적 요청하기'} <Send className="w-4 h-4 ml-2 shrink-0" /></>
                      )}
                    </button>
                  )}
                </div>

              </form>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="quote-confirm-title" className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in relative">
            <div className="mx-auto w-16 h-16 bg-[#39B54A]/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-[#39B54A]" />
            </div>
            <h3 id="quote-confirm-title" className="text-2xl font-bold text-center text-gray-900 mb-2">상담 요청을 접수할까요?</h3>
            <p className="text-center text-gray-500 mb-8">입력하신 정보를 바탕으로 의뢰하겠습니다.</p>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button 
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-[#39B54A] hover:bg-[#2e933c] transition-colors shadow-lg shadow-[#39B54A]/20"
              >
                제출하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
