import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as cors from 'cors';

export interface SavedInquiry {
    id: string; title: string; user_name?: string; user_email?: string;
    company_name?: string; content: string; category: string; created_at: string;
}
interface Dependencies {
    getInquiry(id: string): Promise<SavedInquiry | undefined>;
    listNew(after: string, afterId: string): Promise<SavedInquiry[]>;
    isAdmin(uid: string): Promise<boolean>;
    config(): Promise<{ notificationsEnabled: boolean; recipients: string[] }>;
    send(inquiry: SavedInquiry, recipients: string[]): Promise<{ id: string | null }>;
    log(inquiry: SavedInquiry, recipients: string[], status: 'sent' | 'failed' | 'skipped', error?: string): Promise<void>;
}
type DeliveryState = { status: string; attempts?: number; updatedAt?: string; error?: string; providerId?: string | null };
const validId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const corsHandler = cors({ origin: true });

export function createInquiryNotifications(deps: Dependencies) {
    // Server-only collection: never store inquiry bodies, recipients or contact details here.
    const db = () => admin.firestore();
    const records = () => db().collection('inquiry_notification_delivery');
    const control = () => db().collection('inquiry_notification_control').doc('monitor');
    const authorize = async (header?: string) => {
        if (!header?.startsWith('Bearer ')) return false;
        try { const token = await admin.auth().verifyIdToken(header.slice(7)); return await deps.isAdmin(token.uid); }
        catch { return false; }
    };

    async function deliver(inquiry: SavedInquiry, manual = false): Promise<DeliveryState> {
        const ref = records().doc(inquiry.id);
        const claimed = await db().runTransaction(async transaction => {
            const snapshot = await transaction.get(ref);
            const previous = snapshot.data() as DeliveryState | undefined;
            if (previous?.status === 'sent') return { claimed: false, state: previous };
            if (previous?.status === 'sending') {
                if (Date.now() - Date.parse(previous.updatedAt || '') < 10 * 60_000) return { claimed: false, state: previous };
                const state = { ...previous, status: 'uncertain', error: '발송 도중 처리가 중단되었습니다. 수신 여부를 확인해 주세요.' };
                transaction.set(ref, state);
                return { claimed: false, state };
            }
            if (!manual && (previous?.status === 'uncertain' || previous?.status === 'skipped' || (previous?.attempts || 0) >= 3)) return { claimed: false, state: previous! };
            const state: DeliveryState = { status: 'sending', attempts: (previous?.attempts || 0) + 1, updatedAt: new Date().toISOString(), error: '' };
            transaction.set(ref, state);
            return { claimed: true, state };
        });
        if (!claimed.claimed) return claimed.state;
        let recipients: string[] = [];
        let smtpStarted = false;
        let accepted = false;
        try {
            const config = await deps.config(); recipients = config.recipients;
            if (!config.notificationsEnabled) {
                const state = { ...claimed.state, status: 'skipped', error: '관리자 메일 알림이 꺼져 있습니다.', updatedAt: new Date().toISOString() };
                await ref.set(state); await deps.log(inquiry, recipients, 'skipped', state.error); return state;
            }
            if (!recipients.length) throw new Error('수신 이메일이 설정되지 않았습니다.');
            smtpStarted = true;
            const result = await deps.send(inquiry, recipients); accepted = true;
            const state = { ...claimed.state, status: 'sent', providerId: result.id, updatedAt: new Date().toISOString(), error: '' };
            // Do not retry SMTP if this write fails: receipt may already have occurred.
            await ref.set(state);
            await deps.log(inquiry, recipients, 'sent');
            return state;
        } catch (error) {
            console.error('inquiry_notification_failure', { inquiryId: inquiry.id, smtpStarted, accepted, error });
            const state = { ...claimed.state, status: smtpStarted ? 'uncertain' : 'failed', updatedAt: new Date().toISOString(),
                error: smtpStarted ? '발송 결과를 확정하지 못했습니다. 받은편지함 확인 후 재시도하세요.' : '메일 설정 또는 서버 연결을 확인해 주세요.' };
            await ref.set(state);
            await deps.log(inquiry, recipients, 'failed', state.error);
            return state;
        }
    }

    const send = functions.runWith({ timeoutSeconds: 120 }).https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            if (req.method !== 'POST') { res.status(405).json({ error: 'POST 요청만 가능합니다.' }); return; }
            const id = req.body?.inquiryId;
            if (!validId(id)) { res.status(400).json({ error: '유효한 문의 ID가 필요합니다.' }); return; }
            try {
                const manual = req.body?.retry === true;
                if (manual && !await authorize(req.headers.authorization)) { res.status(403).json({ error: '관리자 인증이 필요합니다.' }); return; }
                const inquiry = await deps.getInquiry(id);
                if (!inquiry || !['quote', 'partner'].includes(inquiry.category)) { res.status(404).json({ error: '견적 또는 제휴 문의를 찾을 수 없습니다.' }); return; }
                if (!manual && Date.now() - Date.parse(inquiry.created_at) > 24 * 60 * 60_000) { res.status(403).json({ error: '기존 문의 재발송은 관리자에서 진행해 주세요.' }); return; }
                const state = await deliver(inquiry, manual);
                res.status(state.status === 'sent' ? 200 : 202).json({ ...state, inquiryId: id });
            } catch (error) {
                console.error('inquiry_notification_request_failure', { inquiryId: id, error });
                res.status(503).json({ error: '알림 서버에서 처리 결과를 확인하지 못했습니다. 문의 접수 내역은 유지됩니다.' });
            }
        });
    });

    const status = functions.https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            if (req.method !== 'POST') { res.status(405).json({ error: 'POST 요청만 가능합니다.' }); return; }
            if (!await authorize(req.headers.authorization)) { res.status(403).json({ error: '관리자 인증이 필요합니다.' }); return; }
            try {
                if (req.body?.action === 'enable') {
                    // Starts at activation time; historical inquiries are never bulk mailed.
                    await db().runTransaction(async transaction => {
                        const snapshot = await transaction.get(control());
                        if (!snapshot.exists) transaction.set(control(), { enabled: true, startedAt: new Date().toISOString(), cursorAt: new Date().toISOString(), cursorId: '00000000-0000-0000-0000-000000000000' });
                    });
                }
                const ids = req.body?.ids;
                if (!Array.isArray(ids) || ids.length > 100 || !ids.every(validId)) { res.status(400).json({ error: '최대 100개의 유효한 문의 ID가 필요합니다.' }); return; }
                const snapshots = ids.length ? await db().getAll(...ids.map(id => records().doc(id))) : [];
                const states: Record<string, DeliveryState> = {};
                for (const snapshot of snapshots) {
                    const state = snapshot.data() as DeliveryState | undefined;
                    states[snapshot.id] = state?.status === 'sending' && Date.now() - Date.parse(state.updatedAt || '') > 10 * 60_000
                        ? { ...state, status: 'uncertain', error: '처리가 중단되었을 수 있습니다. 수신 여부 확인이 필요합니다.' }
                        : state || { status: 'untracked' };
                }
                const monitor = (await control().get()).data();
                res.json({ states, monitor: monitor || { enabled: false } });
            } catch (error) { console.error('inquiry_notification_status_failure', error); res.status(503).json({ error: '알림 기록 저장소를 조회할 수 없습니다.' }); }
        });
    });

    const reconcile = functions.runWith({ timeoutSeconds: 540 }).pubsub.schedule('every 5 minutes').onRun(async () => {
        const monitor = (await control().get()).data();
        if (!monitor?.enabled) return;
        const lease = await db().runTransaction(async transaction => {
            const current = (await transaction.get(control())).data();
            if (current?.leaseUntil > Date.now()) return false;
            transaction.update(control(), { leaseUntil: Date.now() + 10 * 60_000 }); return true;
        });
        if (!lease) return;
        try {
            // Retry definite pre-SMTP failures only. Ambiguous SMTP outcomes require a human.
            const failures = await records().where('status', '==', 'failed').limit(10).get();
            for (const doc of failures.docs) {
                if ((doc.data().attempts || 0) >= 3) continue;
                const inquiry = await deps.getInquiry(doc.id); if (inquiry) await deliver(inquiry);
            }
            const current = (await control().get()).data()!;
            const rows = (await deps.listNew(current.cursorAt, current.cursorId)).slice(0, 10);
            for (const inquiry of rows) {
                await deliver(inquiry);
                await control().update({ cursorAt: inquiry.created_at, cursorId: inquiry.id });
            }
            await control().update({ lastCheckedAt: new Date().toISOString(), lastError: '' });
        } catch (error) {
            await control().update({ lastError: '자동 확인에 실패했습니다. 서버 로그를 확인해 주세요.' });
            throw error;
        } finally { await control().update({ leaseUntil: 0 }); }
    });
    return { send, status, reconcile };
}
