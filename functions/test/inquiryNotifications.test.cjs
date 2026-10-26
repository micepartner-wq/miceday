const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const id = '12345678-1234-1234-1234-123456789abc';
function fixture(options = {}) {
    const store = new Map(); let sends = 0; let lock = Promise.resolve();
    const inquiry = { id, title: 'test inquiry', user_name: 'test', content: 'stored content', category: 'quote', created_at: new Date().toISOString(), ...options.inquiry };
    const snapshot = key => ({ id: key.split('/').pop(), exists: store.has(key), data: () => store.get(key) });
    const doc = key => ({ key, get: async () => snapshot(key), set: async value => {
        if (options.failSentWrite && value.status === 'sent') throw Error('write failed');
        store.set(key, value);
    }, update: async value => store.set(key, { ...store.get(key), ...value }) });
    const db = {
        collection: name => ({
            doc: key => doc(name + '/' + key),
            where: (_field, _op, value) => ({ limit: () => ({ get: async () => ({ docs: [...store].filter(([k, v]) => k.startsWith(name + '/') && v.status === value).map(([k]) => snapshot(k)) }) }) }),
        }),
        getAll: async (...refs) => refs.map(ref => snapshot(ref.key)),
        runTransaction: action => {
            const task = lock.then(() => action({ get: ref => ref.get(), set: (ref, value) => { store.set(ref.key, value); }, update: (ref, value) => { store.set(ref.key, { ...store.get(ref.key), ...value }); } }));
            lock = task.catch(() => {}); return task;
        },
    };
    const wrappers = { https: { onRequest: fn => fn }, pubsub: { schedule: () => ({ onRun: fn => fn }) } };
    const exports = {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../lib/inquiryNotifications.js'), 'utf8'), {
        exports, console: { error() {} }, Date,
        require: name => name === 'firebase-admin' ? { firestore: () => db, auth: () => ({ verifyIdToken: async token => { if (token !== 'admin') throw Error('invalid'); return { uid: 'admin' }; } }) }
            : name === 'firebase-functions' ? { ...wrappers, runWith: () => wrappers }
            : () => (_req, _res, next) => next(),
    });
    const endpoints = exports.createInquiryNotifications({
        getInquiry: async () => options.missing ? undefined : inquiry,
        listNew: async () => [inquiry], isAdmin: async uid => uid === 'admin',
        config: async () => { if (options.configFail) throw Error('config unavailable'); return { notificationsEnabled: !options.disabled, recipients: ['configured-admin@example.com'] }; },
        send: async (saved, recipients) => { sends++; assert.equal(saved.content, 'stored content'); assert.equal(recipients[0], 'configured-admin@example.com'); if (options.smtpFail) throw Error('SMTP timeout'); return { id: 'provider-id' }; },
        log: async () => {},
    });
    async function request(handler, body, token) {
        let resolveResult;
        const resultPromise = new Promise(resolve => { resolveResult = resolve; });
        const res = { status(code) { this.code = code; return this; }, json(data) { resolveResult({ code: this.code || 200, data }); } };
        handler({ method: 'POST', body, headers: { authorization: token ? 'Bearer ' + token : undefined } }, res);
        return Promise.race([resultPromise, new Promise((_, reject) => setTimeout(() => reject(Error('request timeout')), 100))]);
    }
    return { ...endpoints, request, store, sends: () => sends, inquiry };
}
test('duplicate concurrent requests send once, using stored inquiry and configured recipients', async () => {
    const f = fixture(); await Promise.all([f.request(f.send, { inquiryId: id, content: 'forged', to: 'attacker' }), f.request(f.send, { inquiryId: id })]);
    assert.equal(f.sends(), 1); assert.equal((await f.request(f.send, { inquiryId: id })).data.status, 'sent');
});
test('SMTP uncertainty is recorded and never automatically sent again', async () => {
    const f = fixture({ smtpFail: true }); assert.equal((await f.request(f.send, { inquiryId: id })).data.status, 'uncertain');
    await f.request(f.send, { inquiryId: id }); assert.equal(f.sends(), 1);
});
test('accepted mail with failed status write does not cause automatic duplicate', async () => {
    const f = fixture({ failSentWrite: true }); await f.request(f.send, { inquiryId: id }); await f.request(f.send, { inquiryId: id }); assert.equal(f.sends(), 1);
});
test('pre-SMTP failure is visible and automatic attempts stop at three', async () => {
    const f = fixture({ configFail: true }); for (let i = 0; i < 5; i++) await f.request(f.send, { inquiryId: id });
    const state = f.store.get('inquiry_notification_delivery/' + id); assert.equal(state.status, 'failed'); assert.equal(state.attempts, 3); assert.equal(f.sends(), 0);
});
test('disabled notifications are skipped, never labelled sent', async () => {
    const f = fixture({ disabled: true }); assert.equal((await f.request(f.send, { inquiryId: id })).data.status, 'skipped'); assert.equal(f.sends(), 0);
});
test('manual retry and status access require administrator authentication', async () => {
    const f = fixture(); assert.equal((await f.request(f.send, { inquiryId: id, retry: true })).code, 403);
    assert.equal((await f.request(f.status, { ids: [id] })).code, 403); assert.equal(f.sends(), 0);
});
test('historical inquiry requires explicit administrator retry', async () => {
    const f = fixture({ inquiry: { created_at: '2026-01-01T00:00:00Z' } });
    assert.equal((await f.request(f.send, { inquiryId: id })).code, 403);
    assert.equal((await f.request(f.send, { inquiryId: id, retry: true }, 'admin')).data.status, 'sent');
});
test('untracked record remains unknown and querying never sends mail', async () => {
    const f = fixture(); const result = await f.request(f.status, { ids: [id] }, 'admin'); assert.equal(result.data.states[id].status, 'untracked'); assert.equal(f.sends(), 0);
});
test('monitor is opt-in; activation does not send historical mail or reset cutoff', async () => {
    const f = fixture(); await f.reconcile(); assert.equal(f.sends(), 0);
    await f.request(f.status, { ids: [], action: 'enable' }, 'admin'); const first = f.store.get('inquiry_notification_control/monitor').cursorAt;
    await f.request(f.status, { ids: [], action: 'enable' }, 'admin'); assert.equal(f.store.get('inquiry_notification_control/monitor').cursorAt, first); assert.equal(f.sends(), 0);
    await f.reconcile(); assert.equal(f.sends(), 1); assert.equal(f.store.get('inquiry_notification_control/monitor').cursorId, id);
});
test('expired sending state is uncertain rather than automatically resent', async () => {
    const f = fixture(); f.store.set('inquiry_notification_delivery/' + id, { status: 'sending', updatedAt: '2026-01-01T00:00:00Z', attempts: 1 });
    assert.equal((await f.request(f.send, { inquiryId: id })).data.status, 'uncertain'); assert.equal(f.sends(), 0);
});

