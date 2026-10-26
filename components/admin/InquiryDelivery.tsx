import React, { useEffect, useState } from 'react';
import { auth } from '../../src/firebase';
import { Inquiry } from '../../src/api/inquiryApi';
import { getInquiryNotificationStates, INQUIRY_DELIVERY_TRACKING_ENABLED, InquiryDeliveryState, InquiryMonitor, sendInquiryNotificationEmail } from '../../src/utils/email';
import { Link } from 'react-router-dom';

export function useInquiryDelivery(inquiries: Inquiry[]) {
    const [states, setStates] = useState<Record<string, InquiryDeliveryState>>({});
    const [monitor, setMonitor] = useState<InquiryMonitor>({ enabled: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [revision, setRevision] = useState(0);
    const ids = inquiries.filter(i => ['quote', 'partner'].includes(i.category || '')).map(i => i.id!).filter(Boolean);
    const idKey = ids.join(',');
    useEffect(() => {
        if (!INQUIRY_DELIVERY_TRACKING_ENABLED) { setLoading(false); return; }
        let active = true;
        async function load() {
            setLoading(true); setError(''); setStates({});
            try {
                if (!auth.currentUser) throw new Error('관리자 로그인이 필요합니다.');
                const result = await getInquiryNotificationStates(idKey ? idKey.split(',') : [], await auth.currentUser.getIdToken());
                if (active) { setStates(result.states); setMonitor(result.monitor); }
            } catch (e) { if (active) setError(e instanceof Error ? e.message : '메일 상태 조회 실패'); }
            finally { if (active) setLoading(false); }
        }
        void load();
        return () => { active = false; };
    }, [idKey, revision]);
    const enable = async () => {
        if (!confirm('지금 이후 접수되는 새 견적·제휴 문의를 5분마다 확인하고 알림을 보냅니다. 기존 문의는 일괄 발송하지 않습니다. 시작할까요?')) return;
        setBusy('monitor'); setError('');
        try {
            if (!auth.currentUser) throw new Error('관리자 로그인이 필요합니다.');
            const result = await getInquiryNotificationStates(ids, await auth.currentUser.getIdToken(), true);
            setMonitor(result.monitor); setRevision(r => r + 1);
        } catch (e) { setError(e instanceof Error ? e.message : '자동 확인 활성화 실패'); }
        finally { setBusy(''); }
    };
    const retry = async (inquiry: Inquiry) => {
        if (!confirm(`“${inquiry.title}” 알림을 설정된 관리자 수신처로 보냅니다. 기존 기록이 없거나 결과가 불확실한 경우 중복 수신될 수 있습니다. 받은편지함을 확인하셨나요?`)) return;
        setBusy(inquiry.id!);
        try {
            if (!auth.currentUser) throw new Error('관리자 로그인이 필요합니다.');
            await sendInquiryNotificationEmail({ inquiryId: inquiry.id!, title: inquiry.title, requesterName: inquiry.user_name || '', content: inquiry.content }, await auth.currentUser.getIdToken());
        } catch (e) { alert(e instanceof Error ? e.message : '발송 결과를 확인하지 못했습니다.'); }
        finally { setBusy(''); setRevision(r => r + 1); }
    };
    return { states, monitor, error, loading, busy, retry, enable, refresh: () => setRevision(r => r + 1) };
}
export type InquiryDeliveryController = ReturnType<typeof useInquiryDelivery>;

export const InquiryDeliveryBanner = ({ delivery }: { delivery: InquiryDeliveryController }) => !INQUIRY_DELIVERY_TRACKING_ENABLED ? <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
    <strong>문의 접수와 메일 수신을 함께 확인해 주세요.</strong>
    <p className="mt-1">새 알림 추적·자동 재시도 기능은 서버 준비 중입니다. 현재 문의 목록과 기존 메일 발송 기록을 확인하고, 기록이 없는 문의도 직접 확인해 주세요.</p>
    <Link to="/admin/booking-email" className="mt-2 inline-block font-semibold underline underline-offset-4">기존 메일 발송 기록 보기</Link>
</div> : <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
    <div className="flex flex-wrap items-center justify-between gap-3"><strong>문의 처리 상태와 메일 발송 상태는 별도로 확인하세요.</strong><button className="rounded-lg border border-amber-300 px-3 py-2 disabled:opacity-50" onClick={delivery.refresh} disabled={delivery.loading || !!delivery.busy}>알림 상태 새로고침</button></div>
    {delivery.error ? <p className="mt-2 text-red-700" role="alert">알림 상태를 조회하지 못했습니다: {delivery.error} — 발송 성공으로 간주하지 마세요.</p> : delivery.loading ? <p className="mt-2" role="status">알림 상태 확인 중…</p> : <>
        <p className="mt-2">{delivery.monitor.enabled ? `새 문의 자동 확인 사용 중 · 최근 확인: ${delivery.monitor.lastCheckedAt ? new Date(delivery.monitor.lastCheckedAt).toLocaleString('ko-KR') : '첫 실행 대기'}` : '서버 자동 확인이 아직 활성화되지 않았습니다.'}</p>
        {delivery.monitor.lastError && <p role="alert" className="mt-2 text-red-700">{delivery.monitor.lastError}</p>}
        {delivery.monitor.enabled && (!delivery.monitor.lastCheckedAt ? Date.now() - Date.parse(delivery.monitor.startedAt || '') > 15 * 60_000 : Date.now() - Date.parse(delivery.monitor.lastCheckedAt) > 15 * 60_000) && <p role="alert" className="mt-2 font-semibold text-red-700">15분 이상 자동 확인 기록이 없습니다. 예약 작업 상태를 확인해 주세요.</p>}
        {!delivery.monitor.enabled && <button onClick={delivery.enable} disabled={!!delivery.busy} className="mt-3 rounded-lg bg-amber-900 px-4 py-2 text-white disabled:opacity-50">{delivery.busy === 'monitor' ? '활성화 중…' : '지금부터 새 문의 자동 확인 시작'}</button>}
    </>}
    <p className="mt-2 text-xs leading-6">이전 문의는 새 추적 기록이 없을 수 있습니다. ‘기록 없음’이 미발송을 뜻하지는 않습니다. 기존 견적 메일 기록과 받은편지함을 확인하세요. ‘발송 서버 접수’도 실제 수신함 도착을 보장하지 않습니다.</p>
</div>;

export const InquiryDeliveryCell = ({ inquiry, delivery }: { inquiry: Inquiry; delivery: InquiryDeliveryController }) => {
    if (!['quote', 'partner'].includes(inquiry.category || '')) return <span className="text-xs text-slate-400">자동 알림 대상 아님</span>;
    if (!INQUIRY_DELIVERY_TRACKING_ENABLED) return <Link to="/admin/booking-email" onClick={e => e.stopPropagation()} className="text-xs font-medium text-amber-800 underline underline-offset-4">발송 기록 확인</Link>;
    if (delivery.loading) return <span className="text-xs text-slate-500">확인 중…</span>;
    if (delivery.error) return <span className="text-xs font-semibold text-red-700">상태 조회 실패</span>;
    const state = delivery.states[inquiry.id!] || { status: 'untracked' };
    const labels = { sent: '발송 서버 접수', sending: '발송 처리 중', failed: '발송 실패', uncertain: '발송 확인 필요', skipped: '알림 꺼짐', untracked: '추적 기록 없음' };
    return <div className="min-w-32 text-xs" onClick={e => e.stopPropagation()}>
        <span className={`font-semibold ${state.status === 'sent' ? 'text-green-800' : 'text-amber-800'}`}>{labels[state.status]}</span>
        {state.error && <p className="mt-1 max-w-48 leading-5 text-slate-500">{state.error}</p>}
        {state.status !== 'sent' && state.status !== 'sending' && <button onClick={() => delivery.retry(inquiry)} disabled={!!delivery.busy} className="mt-2 block rounded border border-slate-300 bg-white px-2 py-1.5 text-slate-700 disabled:opacity-40">{delivery.busy === inquiry.id ? '처리 중…' : '수신 확인 후 알림 재시도'}</button>}
    </div>;
};
