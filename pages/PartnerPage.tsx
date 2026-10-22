import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { supabase } from '../src/lib/supabase';
import { sendInquiryNotificationEmail } from '../src/utils/email';
import { Calendar, ChevronRight, Briefcase, Mail, Phone, MapPin, Building, User, Send, Building2, UserCircle, MessageSquare, CheckCircle2, Award } from 'lucide-react';

type TabType = 'quote' | 'partner';

export const PartnerPage: React.FC = () => {
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [businessNumber, setBusinessNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [managerName, setManagerName] = useState('');
    const [email, setEmail] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [content, setContent] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        let formatted = value;
        if (value.length > 3 && value.length <= 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        }
        
        setPhoneNumber(formatted);
    };

    const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        
        let formatted = value;
        if (value.length > 3 && value.length <= 5) {
            formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 5) {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
        }
        
        setBusinessNumber(formatted);
    };

    useEffect(() => {
        // No tab logic needed
    }, [location.search]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            let finalContent = `[파트너 제휴 제안]\n제공 가능 서비스: ${serviceType}\n사업자등록번호: ${businessNumber || '미입력'}\n연락처: ${phoneNumber}\n\n[제안 내용]\n${content}`;

            const { data: result, error } = await supabase.from('inquiries').insert([
                {
                    user_id: 'guest',
                    user_name: managerName,
                    user_email: email,
                    company_name: companyName,
                    category: 'partner',
                    title: `[제휴제안] ${companyName}`,
                    content: finalContent,
                    status: 'pending'
                }
            ]).select().single();

            if (error) throw error;
            
            try {
                await sendInquiryNotificationEmail({
                    inquiryId: result.id,
                    title: `제휴 제안 - ${companyName}`,
                    requesterName: managerName,
                    companyName: companyName,
                    phone: phoneNumber,
                    userEmail: email,
                    content: finalContent,
                });
            } catch (emailError) {
                console.error("이메일 발송 실패:", emailError);
            }
            
            setIsSubmitting(false);
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <>
                <Seo title="문의 완료 | 행사어때" description="성공적으로 문의가 접수되었습니다." />
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="max-w-md mx-auto bg-white p-12 rounded-[2rem] shadow-xl text-center border border-slate-100">
                        <div className="w-24 h-24 bg-[#39B54A]/10 text-[#39B54A] rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">접수 완료!</h2>
                        <p className="text-slate-500 mb-10 leading-relaxed text-lg">
                            보내주신 내용을 담당자가 확인 후<br />
                            빠른 시일 안에 연락드리겠습니다.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-4 bg-[#39B54A] text-white text-lg font-bold rounded-xl hover:bg-[#32a342] transition-colors shadow-lg shadow-[#39B54A]/20"
                        >
                            홈으로 돌아가기
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Seo
                title="제휴 문의 | 행사어때"
                description="행사어때 파트너 제휴 문의를 남겨주세요."
                canonical="/partner"
            />
            
            <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50">
                
                <div className={`w-full lg:w-[30%] bg-slate-950 text-white relative overflow-hidden flex flex-col justify-start gap-20 p-12 pt-[60px] lg:p-20 lg:pt-[80px] min-h-[50vh] lg:min-h-full transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform ${mounted ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/95"></div>

                    <div className="relative z-10 flex flex-col items-center text-center lg:items-end lg:text-right mt-10 lg:mt-20">
                        <div>
                            <h1 className="text-3xl lg:text-3xl xl:text-4xl font-extrabold leading-[1.3] mb-6 tracking-tight break-keep">
                                새로운 비즈니스 가치를<br/>
                                <span className="text-[#39B54A]">함께 만들어갑니다.</span>
                            </h1>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-md break-keep">
                                행사어때에서 든든한 파트너를 기다립니다.
                            </p>
                            
                            {/* 장애인기업 수의계약 뱃지 */}
                            <div className="mt-12 flex justify-center lg:justify-end">
                                <div className="flex items-center gap-3 bg-white/5 border border-white/40 px-5 py-4 rounded-2xl backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                                    <div className="text-right">
                                        <p className="text-xs text-[#39B54A] font-bold mb-1 tracking-wider">공공기관 우선구매 대상</p>
                                        <p className="text-base text-white font-extrabold tracking-tight">장애인기업 (수의계약 가능)</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(57,181,74,0.4)] overflow-hidden border-2 border-[#39B54A]">
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
                                    <div>
                                        <p className="text-xs text-slate-400/80 mb-0.5">고객센터</p>
                                        <p className="text-lg font-bold text-white/90 tracking-tight">1800-1985</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <Phone size={16} className="text-[#39B54A]/80" />
                                    </div>
                                </div>
                                <div className="flex items-start justify-end gap-3">
                                    <div>
                                        <p className="text-xs text-slate-400/80 mb-0.5">이메일</p>
                                        <p className="text-base font-medium text-white/90 tracking-tight">micepartner@micepartner.co.kr</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <Mail size={16} className="text-[#39B54A]/80" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[70%] bg-slate-50 p-6 pt-[30px] md:p-12 md:pt-[60px] lg:p-20 lg:pt-[80px] flex items-start justify-center">
                    <div className={`w-full max-w-4xl bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-[1500ms] delay-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
                        


                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        기업명(상호) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building2 size={18} className="text-slate-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            required 
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-slate-700 placeholder:text-slate-400 placeholder:text-[14px]"
                                            placeholder="기업명 또는 상호명을 입력해주세요"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        담당자 성함 <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={managerName}
                                        onChange={(e) => setManagerName(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-slate-700 placeholder:text-slate-400 placeholder:text-[14px]"
                                        placeholder="담당자명을 입력해주세요."
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        연락처 <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        required 
                                        value={phoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        maxLength={13}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-slate-700 placeholder:text-slate-400 placeholder:text-[14px]"
                                        placeholder="연락처를 입력해주세요."
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        이메일 <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-slate-700 placeholder:text-slate-400 placeholder:text-[14px]"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-8"></div>

                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                    제공 가능 서비스 <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    required
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-slate-700"
                                >
                                    <option value="">분야를 선택해주세요</option>
                                    <option value="공간 대관">공간 대관</option>
                                    <option value="장비 렌탈">장비 렌탈 (음향/조명/무대 등)</option>
                                    <option value="운영 인력">운영 인력 (진행요원/경호 등)</option>
                                    <option value="기획 대행">기획 및 대행</option>
                                    <option value="기타">기타 서비스</option>
                                </select>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700">사업자등록번호</label>
                                <input 
                                    type="text" 
                                    value={businessNumber}
                                    onChange={handleBusinessNumberChange}
                                    maxLength={12}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-slate-700 placeholder:text-slate-400 placeholder:text-[14px]"
                                    placeholder="000-00-00000"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                    제휴 제안 내용 <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    required 
                                    rows={5}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-slate-700 placeholder:text-slate-400 placeholder:text-[14px] resize-none"
                                    placeholder="행사어때와 함께 시너지를 낼 수 있는 제안 내용을 자세히 적어주세요."
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-3 py-5 mt-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-black focus:ring-4 focus:ring-slate-900/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send size={22} />
                                        제휴 문의 접수하기
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
