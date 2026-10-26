import React, { useEffect, useState } from 'react';
import { ImagePlus, Save, ExternalLink } from 'lucide-react';
import { getServiceImages, saveServiceImage, ServiceImage } from '../../src/api/serviceOverviewApi';
import { uploadImage } from '../../src/api/storageApi';

function ImageEditor({ image }: { image: ServiceImage }) {
    const [saved, setSaved] = useState(image);
    const [alt, setAlt] = useState(image.alt);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        if (!file) { setPreview(''); return; }
        const url = URL.createObjectURL(file); setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    const dirty = !!file || alt !== saved.alt;
    useEffect(() => {
        const handler = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty]);
    const save = async (event: React.FormEvent) => {
        event.preventDefault(); setBusy(true); setError(''); setMessage('');
        try {
            if (file) {
                const bitmap = await createImageBitmap(file);
                bitmap.close();
            }
            const src = file ? await uploadImage(file, 'service-overview') : saved.src;
            const next = { ...saved, src, alt: alt.trim() };
            await saveServiceImage(next);
            setSaved(next); setAlt(next.alt); setFile(null);
            setMessage('저장했습니다. 메인 화면을 새로고침하면 반영됩니다.');
        } catch (e) {
            // Preserve uploads on ambiguous network failures: the database write may have committed.
            setError(e instanceof Error ? e.message : '저장하지 못했습니다. 업로드 권한과 네트워크를 확인해 주세요.');
        }
        finally { setBusy(false); }
    };
    return <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">{image.title}</h3>{dirty && <span className="text-xs text-amber-700">저장 전</span>}</div>
        <img src={preview || saved.src} alt={alt} className="aspect-video w-full rounded-lg bg-slate-100 object-cover" />
        <label className={`mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 p-3 text-sm font-semibold ${busy ? 'pointer-events-none opacity-50' : 'hover:bg-slate-50'}`}>
            <ImagePlus size={18} /> 사진 선택
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="sr-only" onChange={e => {
                const picked = e.target.files?.[0]; e.target.value = ''; if (!picked) return;
                setError(''); setMessage('');
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(picked.type) || picked.size > 10 * 1024 * 1024) { setError('JPG, PNG, WebP 이미지(최대 10MB)를 선택해 주세요.'); return; }
                setFile(picked);
            }} />
        </label>
        <p className="mt-2 truncate text-xs text-slate-500">{file?.name || '가로 16:9 권장 · 중앙 기준으로 표시됩니다.'}</p>
        <label className="mt-5 block text-sm font-medium">이미지 설명<input value={alt} onChange={e => { setAlt(e.target.value); setMessage(''); }} required maxLength={200} disabled={busy} className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm" /></label>
        <div className="mt-5 flex gap-2"><button type="submit" disabled={busy || !dirty || !alt.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-800 p-3 text-sm font-semibold text-white disabled:opacity-40"><Save size={16} />{busy ? '저장 중…' : '변경사항 저장'}</button><button type="button" disabled={busy || !dirty} onClick={() => { setFile(null); setAlt(saved.alt); setError(''); setMessage(''); }} className="rounded-lg border px-4 text-sm disabled:opacity-40">취소</button></div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-3 text-sm text-green-800">{message}</p>}
    </form>;
}

export default function ServiceOverviewManager() {
    const [images, setImages] = useState<ServiceImage[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const load = async () => {
        setLoading(true); setError('');
        try { setImages(await getServiceImages()); }
        catch { setError('저장된 이미지를 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { void load(); }, []);
    return <div className="max-w-6xl">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">서비스 소개 이미지</h2><p className="mt-2 text-sm leading-6 text-slate-500">메인 화면의 공간·장비, 비품·제작물, 인력·운영 사진을 변경합니다.</p></div><a href="/#service-overview" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm">메인 화면 보기 <ExternalLink size={15} /></a></div>
        <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-900">사진을 선택한 뒤 미리보기를 확인하고 저장하세요. 저장하면 연결된 사이트에 적용됩니다. JPG·PNG·WebP, 최대 10MB.</div>
        {loading ? <p role="status">이미지를 불러오는 중…</p> : error ? <div role="alert" className="rounded-xl border bg-white p-6"><p>{error}</p><button onClick={load} className="mt-4 rounded-lg bg-green-800 px-4 py-2 text-white">다시 시도</button></div> : <div className="grid gap-5 xl:grid-cols-3">{images.map(image => <ImageEditor key={image.id} image={image} />)}</div>}
    </div>;
}
