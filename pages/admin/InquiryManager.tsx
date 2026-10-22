import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Send, Trash2, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import { getAllInquiries, answerInquiry, deleteInquiry, Inquiry } from '../../src/api/inquiryApi';

export const InquiryManager: React.FC = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

    const loadInquiries = async () => {
        try {
            const data = await getAllInquiries();
            setInquiries(data);
        } catch (error) {
            console.error('Failed to load inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInquiries();
    }, []);

    const handleAnswer = async (id: string) => {
        if (!answerText.trim()) return;
        setSaving(true);
        try {
            const nextAnswer = answerText.trim();
            const answeredAt = new Date().toISOString();
            await answerInquiry(id, nextAnswer);
            setInquiries(prev => prev.map(inquiry =>
                inquiry.id === id
                    ? { ...inquiry, answer: nextAnswer, status: 'answered', answered_at: answeredAt }
                    : inquiry
            ));
            setAnswerText('');
            setExpandedId(null);
        } catch (error) {
            console.error('Failed to answer inquiry:', error);
            alert('답변 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이 문의를 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) return;
        try {
            await deleteInquiry(id);
            setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));
            if (expandedId === id) {
                setExpandedId(null);
                setAnswerText('');
            }
        } catch (error) {
            console.error('Failed to delete inquiry:', error);
            alert('삭제에 실패했습니다.');
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const filteredInquiries = inquiries.filter(i => {
        if (filter === 'all') return true;
        return i.status === filter;
    });

    const pendingCount = inquiries.filter(i => i.status === 'pending').length;
    const answeredCount = inquiries.filter(i => i.status === 'answered').length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-slate-800 mb-4" size={48} />
                <p className="text-slate-500 font-medium">데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                            <MessageSquare size={24} />
                        </div>
                        문의 접수 관리
                    </h1>
                    <p className="text-slate-500 mt-3 ml-1 text-[15px]">웹사이트를 통해 접수된 견적 및 제휴 문의를 확인하고 관리합니다.</p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <button onClick={() => setFilter('all')} className={`p-6 rounded-3xl border-2 transition-all text-left ${filter === 'all' ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/10' : 'bg-white border-transparent shadow-sm hover:border-slate-200 hover:shadow-md'}`}>
                    <div className={`text-sm font-bold mb-2 ${filter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>전체 문의</div>
                    <div className={`text-4xl font-extrabold tracking-tight ${filter === 'all' ? 'text-white' : 'text-slate-900'}`}>{inquiries.length}</div>
                </button>
                <button onClick={() => setFilter('pending')} className={`p-6 rounded-3xl border-2 transition-all text-left ${filter === 'pending' ? 'bg-orange-500 border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white border-transparent shadow-sm hover:border-slate-200 hover:shadow-md'}`}>
                    <div className={`text-sm font-bold mb-2 ${filter === 'pending' ? 'text-orange-100' : 'text-slate-500'}`}>답변 대기</div>
                    <div className={`text-4xl font-extrabold tracking-tight ${filter === 'pending' ? 'text-white' : 'text-orange-500'}`}>{pendingCount}</div>
                </button>
                <button onClick={() => setFilter('answered')} className={`p-6 rounded-3xl border-2 transition-all text-left ${filter === 'answered' ? 'bg-[#39B54A] border-[#39B54A] shadow-xl shadow-[#39B54A]/20' : 'bg-white border-transparent shadow-sm hover:border-slate-200 hover:shadow-md'}`}>
                    <div className={`text-sm font-bold mb-2 ${filter === 'answered' ? 'text-green-100' : 'text-slate-500'}`}>처리 완료</div>
                    <div className={`text-4xl font-extrabold tracking-tight ${filter === 'answered' ? 'text-white' : 'text-[#39B54A]'}`}>{answeredCount}</div>
                </button>
            </div>

            {/* Inquiry List */}
            {filteredInquiries.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare size={32} />
                    </div>
                    <p className="text-slate-500 font-bold text-lg">
                        {filter === 'all' ? '등록된 문의가 없습니다.' : filter === 'pending' ? '대기 중인 문의가 없습니다.' : '완료된 문의가 없습니다.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredInquiries.map((item) => (
                        <div key={item.id} className={`bg-white rounded-3xl border transition-all duration-300 ${expandedId === item.id ? 'border-slate-300 shadow-xl shadow-slate-200/50' : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'}`}>
                            {/* List Item Header */}
                            <div
                                className="p-6 cursor-pointer flex items-start gap-5"
                                onClick={() => {
                                    if (expandedId === item.id) {
                                        setExpandedId(null);
                                    } else {
                                        setExpandedId(item.id || null);
                                        if (item.answer) setAnswerText(item.answer);
                                        else setAnswerText('');
                                    }
                                }}
                            >
                                {/* Icon Badge */}
                                <div className="mt-1 flex-shrink-0">
                                    {item.status === 'answered' ? (
                                        <div className="w-12 h-12 rounded-2xl bg-[#39B54A]/10 text-[#39B54A] flex items-center justify-center">
                                            <CheckCircle size={24} />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
                                            <Clock size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Content Summary */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                                        <span className={`px-3 py-1 text-xs font-extrabold rounded-lg ${item.status === 'answered' ? 'bg-[#39B54A]/10 text-[#39B54A]' : 'bg-orange-100 text-orange-600'}`}>
                                            {item.status === 'answered' ? '답변완료' : '답변대기'}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-extrabold rounded-lg ${item.category === 'quote' ? 'bg-blue-100 text-blue-600' : item.category === 'partner' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.category === 'quote' ? '견적 문의' : item.category === 'partner' ? '제휴 제안' : item.category || '기타'}
                                        </span>
                                        <span className="text-sm text-slate-400 ml-auto font-medium">{formatDate(item.created_at!)}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 truncate tracking-tight">{item.title}</h3>
                                </div>

                                {/* Toggle Icon */}
                                <div className="flex items-center gap-2 flex-shrink-0 mt-3 ml-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expandedId === item.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}>
                                        {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Detail Panel */}
                            {expandedId === item.id && (
                                <div className="px-6 pb-6 pt-2 animate-fadeIn border-t border-slate-100">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                        
                                        {/* Left: Customer Question */}
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                                            <div className="flex flex-col mb-4">
                                                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                                    <MessageSquare size={16} className="text-slate-500" /> 접수된 원본 내용
                                                </h4>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-[15px] text-slate-700 leading-relaxed font-medium">
                                                {item.company_name && <div>기업명: {item.company_name}</div>}
                                                {item.user_name && <div>담당자: {item.user_name}</div>}
                                                {item.user_email && <div>이메일: {item.user_email}</div>}
                                                {(item.company_name || item.user_name || item.user_email) && <div className="h-px bg-slate-100 my-4"></div>}
                                                <div className="whitespace-pre-wrap">{item.content}</div>
                                            </div>
                                            <div className="mt-5 flex justify-end">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id!); }}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} /> 문의 내역 영구 삭제
                                                </button>
                                            </div>
                                        </div>

                                        {/* Right: Admin Answer/Memo */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                                                <Send size={16} className="text-[#39B54A]" /> 관리자 메모 및 처리 상태
                                            </h4>
                                            <textarea
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                                placeholder="고객 응대 내용이나 메모를 자유롭게 기록해두세요."
                                                rows={7}
                                                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#39B54A]/20 focus:border-[#39B54A] outline-none transition-all text-[15px] text-slate-700 resize-none font-medium"
                                            />
                                            <div className="flex justify-end mt-5">
                                                <button
                                                    onClick={() => handleAnswer(item.id!)}
                                                    disabled={saving || !answerText.trim()}
                                                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[15px] hover:bg-black transition-all disabled:bg-slate-300 shadow-lg shadow-slate-900/10"
                                                >
                                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                    {item.status === 'answered' ? '처리 내용 수정하기' : '답변 완료 처리하기'}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
