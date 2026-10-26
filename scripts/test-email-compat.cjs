const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load({ body, type = 'application/json', status = 200, tracking = false, dev = false } = {}) {
    const source = fs.readFileSync('src/utils/email.ts', 'utf8')
        .replaceAll('import.meta.env.VITE_INQUIRY_DELIVERY_TRACKING_ENABLED', JSON.stringify(String(tracking)))
        .replaceAll('import.meta.env.DEV', String(dev));
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports = {}; const calls = [];
    vm.runInNewContext(js, { exports, console: { error() {} }, AbortSignal,
        window: { location: { hostname: dev ? '192.168.35.242' : 'miceday.co.kr' } },
        fetch: async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return { ok: status >= 200 && status < 300, headers: { get: () => type }, json: async () => body, text: async () => '<html>index</html>' }; },
    });
    return { ...exports, calls };
}
const payload = { inquiryId: 'test-id', title: 'Example inquiry', requesterName: 'Example', content: 'Example content' };
test('current production server gets required fields and its explicit success is accepted', async () => {
    const api = load({ body: { message: 'Inquiry notification email sent successfully', recipientCount: 1 } });
    await api.sendInquiryNotificationEmail(payload);
    assert.equal(api.calls[0].body.title, payload.title);
    assert.equal(api.calls[0].body.requesterName, payload.requesterName);
    assert.equal(api.calls[0].url, '/api/email/inquiry-notification');
});
test('future tracking success remains compatible', async () => {
    await load({ body: { status: 'sent' } }).sendInquiryNotificationEmail(payload);
});
test('HTML fallback, skipped response, missing receipt, and uncertain delivery are not success', async () => {
    for (const response of [
        { type: 'text/html' },
        { body: { skipped: true, message: 'notifications disabled' } },
        { body: { message: 'Inquiry notification email sent successfully', recipientCount: 0 } },
        { body: { status: 'uncertain' }, status: 202 },
        { body: { status: 'sending' }, status: 202 },
    ]) await assert.rejects(() => load(response).sendInquiryNotificationEmail(payload));
});
test('disabled tracking makes no admin retry or status requests', async () => {
    const api = load({ body: { status: 'sent' } });
    await assert.rejects(() => api.sendInquiryNotificationEmail(payload, 'admin-token'));
    await assert.rejects(() => api.getInquiryNotificationStates(['test-id'], 'admin-token'));
    assert.equal(api.calls.length, 0);
});
test('LAN development uses the cloud endpoint', async () => {
    const api = load({ dev: true, body: { status: 'sent' } });
    await api.sendInquiryNotificationEmail(payload);
    assert.equal(api.calls[0].url, 'https://us-central1-human-partner.cloudfunctions.net/sendInquiryNotification');
});
