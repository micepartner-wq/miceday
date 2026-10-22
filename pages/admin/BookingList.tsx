import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Trash2, Send, CheckCircle, Clock, Building2, User, Mail, Calendar as CalendarIcon, Phone, Download, Paperclip, MonitorPlay, Layers, BatteryCharging, Coffee, Megaphone, Palette } from 'lucide-react';
import { getInquiriesPage, answerInquiry, deleteInquiry, Inquiry } from '../../src/api/inquiryApi';

export const BookingList = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState('');

    useEffect(() => {
        loadInquiries(page);
    }, [page, pageSize]);

    const loadInquiries = async (targetPage = page) => {
        try {
            setLoading(true);
            const { data, count } = await getInquiriesPage(targetPage, pageSize);
            setInquiries(data);
            setTotalCount(count);
        } catch (error) {
            console.error('Failed to load inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (id: string) => {
        if (!answerText.trim()) return;
        setUpdatingId(id);
        try {
            const nextAnswer = answerText.trim();
            const answeredAt = new Date().toISOString();
            await answerInquiry(id, nextAnswer);
            setInquiries(prev => prev.map(inquiry =>
                inquiry.id === id
                    ? { ...inquiry, answer: nextAnswer, status: 'answered', answered_at: answeredAt }
                    : inquiry
            ));
            alert('메모 및 답변 상태가 저장되었습니다.');
        } catch (error) {
            console.error('Failed to answer inquiry:', error);
            alert('저장에 실패했습니다.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        setDeletingId(id);
        try {
            await deleteInquiry(id);
            const nextPage = inquiries.length === 1 && page > 1 ? page - 1 : page;
            if (nextPage !== page) {
                setPage(nextPage);
            } else {
                await loadInquiries(nextPage);
            }
            alert('문의가 삭제되었습니다.');
            if (expandedId === id) setExpandedId(null);
        } catch (error) {
            console.error('Failed to delete inquiry:', error);
            alert('삭제에 실패했습니다.');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (status: Inquiry['status']) => {
        if (status === 'answered') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm bg-[#39B54A]/10 text-[#39B54A]">
                    <CheckCircle size={14} strokeWidth={2.5} />
                    처리완료
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm bg-orange-100 text-orange-600">
                <Clock size={14} strokeWidth={2.5} />
                답변대기
            </span>
        );
    };

    const getCategoryBadge = (category: string | undefined) => {
        if (category === 'quote') {
            return <span className="px-2 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-100">견적문의</span>;
        }
        if (category === 'partner') {
            return <span className="px-2 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-600 border border-purple-100">제휴제안</span>;
        }
        return <span className="px-2 py-1 text-xs font-bold rounded-md bg-slate-50 text-slate-600 border border-slate-200">{category || '기타'}</span>;
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const renderFormattedContent = (content: string) => {
        if (!content) return null;

        const servicesMatch = content.match(/===SERVICES_START===\n?([\s\S]*?)\n?===SERVICES_END===/);
        const servicesRaw = servicesMatch ? servicesMatch[1] : '';
        const services = servicesRaw ? servicesRaw.split('||').filter(s => s.trim()) : [];

        let cleanContent = content.replace(/===SERVICES_START===\n?[\s\S]*?\n?===SERVICES_END===/, '').trim();

        const fileLines: { name: string; url: string }[] = [];
        const lines = cleanContent.split('\n');
        const normalLines: string[] = [];

        lines.forEach(line => {
            const fileMatch = line.match(/\[다운로드\]\s+(.+?)\s+:\s+(http.+)/);
            if (fileMatch) {
                fileLines.push({ name: fileMatch[1].trim(), url: fileMatch[2].trim() });
            } else {
                normalLines.push(line);
            }
        });

        // Remove empty [첨부파일] headers if files were extracted
        let finalContent = normalLines.join('\n').trim();
        finalContent = finalContent.replace(/\[첨부파일\]\s*$/, '').trim();

        return (
            <div className="space-y-5">
                <div className="whitespace-pre-wrap">{finalContent}</div>
                
                {services.length > 0 && (
                    <div className="p-4 bg-white border border-[#39B54A]/20 rounded-xl shadow-sm">
                        <h5 className="text-xs font-bold text-[#39B54A] mb-3 flex items-center gap-1">
                            <CheckCircle size={14} /> 필요 서비스
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {services.map((s, idx) => {
                                const SERVICE_DETAILS: Record<string, { title: string, desc: string, icon: any }> = {
                                    'stage': { title: '무대 및 A/V 시스템', desc: '조명, 음향, 대형 LED, 무대 렌탈', icon: MonitorPlay },
                                    'booth': { title: '공간 연출 및 부스', desc: '옥타/트러스 부스, 현수막, 가구 렌탈', icon: Layers },
                                    'power': { title: 'IT 장비 및 전력망 구축', desc: '대규모 노트북 대여, 멀티탭 셋팅, 배선 몰딩', icon: BatteryCharging },
                                    'catering': { title: 'F&B 케이터링', desc: '예산 맞춤 간식, 음료, 냉장고 렌탈', icon: Coffee },
                                    'staff': { title: '현장 운영 및 매니지먼트', desc: '스태프 상주, 시상품 대행, 사후 청소', icon: Megaphone },
                                    'design': { title: '홍보 및 디자인 인쇄물', desc: '현수막, 배너, 포스터, 네임택, 굿즈 제작', icon: Palette },
                                };
                                const detail = SERVICE_DETAILS[s];
                                
                                if (!detail) {
                                    return (
                                        <div key={idx} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-[13px]">
                                            {s}
                                        </div>
                                    );
                                }
                                
                                const Icon = detail.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm">
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-[13px]">{detail.title}</div>
                                            <div className="text-slate-500 text-[11px] mt-0.5 tracking-tight">{detail.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {fileLines.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                        <h5 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                            <Paperclip size={14} /> 첨부파일
                        </h5>
                        <div className="flex flex-col gap-2">
                            {fileLines.map((f, idx) => (
                                <a 
                                    key={idx} 
                                    href={f.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 hover:border-[#39B54A] hover:bg-[#39B54A]/5 text-slate-700 rounded-xl transition-all w-fit font-bold text-[13px] shadow-sm group"
                                >
                                    <Paperclip size={16} className="text-slate-400 group-hover:text-[#39B54A]" />
                                    {f.name}
                                    <Download size={14} className="ml-4 text-slate-300 group-hover:text-[#39B54A]" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#39B54A]" size={40} />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="text-[#39B54A]" />
                        스마트 견적 및 제휴 문의 관리
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">총 {totalCount}건의 문의 내역</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPage(1);
                            setPageSize(Number(e.target.value));
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#39B54A]"
                    >
                        {[25, 50, 100].map((size) => (
                            <option key={size} value={size}>{size}개씩 보기</option>
                        ))}
                    </select>
                    <button
                        onClick={() => loadInquiries(page)}
                        className="text-sm font-medium px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                        새로고침
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-bold text-slate-600">구분</th>
                                <th className="text-left px-4 py-3 text-sm font-bold text-slate-600 w-1/4">문의 제목</th>
                                <th className="text-left px-4 py-3 text-sm font-bold text-slate-600">기업/상호명</th>
                                <th className="text-left px-4 py-3 text-sm font-bold text-slate-600">담당자 (이메일)</th>
                                <th className="text-left px-4 py-3 text-sm font-bold text-slate-600">접수일시</th>
                                <th className="text-center px-4 py-3 text-sm font-bold text-slate-600">상태</th>
                                <th className="text-center px-4 py-3 text-sm font-bold text-slate-600">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-slate-400">
                                        등록된 견적/제휴 문의가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((inquiry) => (
                                    <React.Fragment key={inquiry.id}>
                                        <tr
                                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedId === inquiry.id ? 'bg-[#39B54A]/5' : ''}`}
                                            onClick={() => {
                                                if (expandedId === inquiry.id) {
                                                    setExpandedId(null);
                                                } else {
                                                    setExpandedId(inquiry.id || null);
                                                    setAnswerText(inquiry.answer || '');
                                                }
                                            }}
                                        >
                                            <td className="px-4 py-4">
                                                {getCategoryBadge(inquiry.category)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-slate-800 truncate pr-4">
                                                    {inquiry.title}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                                    <Building2 size={14} className="text-slate-400" />
                                                    <span>{inquiry.company_name || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                                                    <User size={14} className="text-slate-400" />
                                                    <span>{inquiry.user_name || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                    <Mail size={12} className="text-slate-400" />
                                                    <span>{inquiry.user_email || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                                                    <CalendarIcon size={14} className="text-slate-400" />
                                                    <span>{formatDate(inquiry.created_at!)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {getStatusBadge(inquiry.status)}
                                            </td>
                                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1">
                                                    {deletingId === inquiry.id ? (
                                                        <Loader2 className="animate-spin text-slate-400" size={20} />
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDelete(inquiry.id!)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="삭제"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === inquiry.id && (
                                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                                <td colSpan={7} className="px-6 py-6">
                                                    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {/* Left: Original Content */}
                                                        <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                                                <MessageSquare size={18} className="text-slate-500" />
                                                                <h4 className="font-bold text-slate-800">접수된 문의 상세 내용</h4>
                                                            </div>
                                                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-[14px] text-slate-700 leading-relaxed font-medium min-h-[150px]">
                                                                {renderFormattedContent(inquiry.content)}
                                                            </div>
                                                        </div>

                                                        {/* Right: Admin Memo/Status */}
                                                        <div className="flex-1 bg-white p-6 rounded-xl border border-[#39B54A]/20 shadow-sm relative">
                                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                                                <Send size={18} className="text-[#39B54A]" />
                                                                <h4 className="font-bold text-slate-800">관리자 처리 메모</h4>
                                                            </div>
                                                            <textarea
                                                                value={answerText}
                                                                onChange={(e) => setAnswerText(e.target.value)}
                                                                placeholder="견적서 발송 여부, 유선 상담 내용 등 처리 결과를 기록해두세요."
                                                                rows={5}
                                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-[14px] text-slate-700 resize-none font-medium"
                                                            />
                                                            <div className="flex justify-end mt-4">
                                                                <button
                                                                    onClick={() => handleAnswer(inquiry.id!)}
                                                                    disabled={updatingId === inquiry.id || !answerText.trim()}
                                                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-all disabled:bg-slate-300"
                                                                >
                                                                    {updatingId === inquiry.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                                                    {inquiry.status === 'answered' ? '처리 내용 수정' : '처리 완료 적용'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">
                    {totalCount === 0 ? '결과 없음' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} / ${totalCount}건`}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1 || loading}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        이전
                    </button>
                    <span className="text-sm font-bold text-slate-700 px-2">
                        {page} <span className="text-slate-400 font-normal">/ {totalPages}</span>
                    </span>
                    <button
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page >= totalPages || loading}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
};
