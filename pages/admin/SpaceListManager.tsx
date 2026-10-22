import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Check, Move, Edit2, X } from 'lucide-react';
import { Container } from '../../components/ui/Container';

// --- 간단한 이미지 크롭 컴포넌트 ---
interface ImageCropperProps {
    file: File;
    onCropComplete: (blob: Blob) => void;
    onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ file, onCropComplete, onCancel }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const cropBoxWidth = 640;
    const cropBoxHeight = 360;

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const generateCrop = async () => {
        if (!imageRef.current) return;
        const canvas = document.createElement('canvas');
        const multiplier = 2; // Output resolution multiplier (1280x720)
        canvas.width = cropBoxWidth * multiplier;
        canvas.height = cropBoxHeight * multiplier;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = imageRef.current;
        const scale = zoom * multiplier;
        const dx = (offset.x * multiplier) + (canvas.width / 2) - ((img.naturalWidth * scale) / 2);
        const dy = (offset.y * multiplier) + (canvas.height / 2) - ((img.naturalHeight * scale) / 2);

        ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);

        canvas.toBlob((blob) => {
            if (blob) onCropComplete(blob);
        }, 'image/webp', 0.95);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full">
                <h3 className="text-xl font-bold mb-4">이미지 자르기 (16:9 비율 - 고화질 1280x720 저장)</h3>
                <p className="text-sm text-slate-500 mb-4">마우스로 이미지를 드래그하여 원하는 영역을 맞추세요.</p>
                
                <div 
                    className="relative bg-slate-200 overflow-hidden mx-auto border-2 border-dashed border-[#39B54A] cursor-move"
                    style={{ width: cropBoxWidth, height: cropBoxHeight, maxWidth: '100%' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                >
                    <img 
                        ref={imageRef}
                        src={imageSrc} 
                        alt="Crop target" 
                        draggable={false}
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                            transformOrigin: 'center',
                            maxWidth: 'none',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginLeft: imageRef.current ? -(imageRef.current.naturalWidth / 2) : 0,
                            marginTop: imageRef.current ? -(imageRef.current.naturalHeight / 2) : 0,
                        }} 
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        <Move size={12} /> 드래그하여 이동
                    </div>
                </div>

                <div className="mt-6 mb-6">
                    <label className="text-sm font-medium text-slate-700 block mb-2">확대/축소</label>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="3" 
                        step="0.05" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-[#39B54A]"
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium">취소</button>
                    <button onClick={generateCrop} className="px-4 py-2 rounded-lg bg-[#39B54A] text-white hover:bg-green-600 font-medium flex items-center gap-2">
                        <Check size={18} /> 자르기 완료
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SpaceListManager = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // 신규 추가 폼 상태
    const [newTitle, setNewTitle] = useState('');
    const [newSubtitle, setNewSubtitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('event_spaces_cards')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (data) setEvents(data);
        setLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleCropComplete = (blob: Blob) => {
        setCroppedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setSelectedFile(null); // 크롭 모달 닫기
    };

    const handleSaveEvent = async () => {
        if (!newTitle.trim() || !newSubtitle.trim()) {
            alert('텍스트를 모두 입력해주세요.');
            return;
        }
        if (!editingId && !croppedBlob) {
            alert('이미지를 등록해주세요.');
            return;
        }

        setIsSaving(true);
        try {
            let finalImageUrl = previewUrl;

            // 1. 이미지 업로드 (새 이미지가 있는 경우)
            if (croppedBlob) {
                const fileName = `space-cards/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
                const { error: uploadError } = await supabase.storage
                    .from('Humanpartner')
                    .upload(fileName, croppedBlob, {
                        contentType: 'image/webp',
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('Humanpartner')
                    .getPublicUrl(fileName);
                
                finalImageUrl = publicUrl;
            }

            // 2. DB 저장 (Update or Insert)
            if (editingId) {
                const { error: dbError } = await supabase
                    .from('event_spaces_cards')
                    .update({
                        title: newTitle,
                        subtitle: newSubtitle,
                        image_url: finalImageUrl
                    })
                    .eq('id', editingId);

                if (dbError) throw dbError;
                alert('성공적으로 수정되었습니다.');
            } else {
                const { error: dbError } = await supabase
                    .from('event_spaces_cards')
                    .insert([{
                        title: newTitle,
                        subtitle: newSubtitle,
                        image_url: finalImageUrl,
                        sort_order: events.length
                    }]);

                if (dbError) throw dbError;
                alert('성공적으로 추가되었습니다.');
            }

            handleCancelEdit();
            fetchEvents();
        } catch (error) {
            console.error('Save event error:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (event: any) => {
        setEditingId(event.id);
        setNewTitle(event.title);
        setNewSubtitle(event.subtitle);
        setPreviewUrl(event.image_url);
        setCroppedBlob(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewTitle('');
        setNewSubtitle('');
        setPreviewUrl(null);
        setCroppedBlob(null);
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await supabase.from('event_spaces_cards').delete().eq('id', id);
            
            const pathMatch = imageUrl.match(/Humanpartner\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
                await supabase.storage.from('Humanpartner').remove([pathMatch[1]]);
            }

            fetchEvents();
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">맞춤형 장소 갤러리 관리 (Space List)</h1>
                <p className="text-slate-500 mt-2">메인 페이지의 중앙 포커스형 슬라이드에 노출될 카드와 텍스트를 관리합니다.</p>
            </div>

            <div className={`bg-white rounded-2xl border ${editingId ? 'border-[#39B54A] shadow-md ring-2 ring-[#39B54A]/20' : 'border-slate-200 shadow-sm'} p-6 mb-10 transition-all`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">{editingId ? '슬라이드 수정' : '새 슬라이드 등록'}</h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors">
                            <X size={16} /> 수정 취소
                        </button>
                    )}
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">분류 텍스트 (예: 기업 워크숍)</label>
                            <input 
                                type="text" 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="노출할 분류를 입력하세요"
                                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-[#39B54A] focus:ring-[#39B54A]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">장소 텍스트 (예: 리조트 대관)</label>
                            <input 
                                type="text" 
                                value={newSubtitle}
                                onChange={(e) => setNewSubtitle(e.target.value)}
                                placeholder="장소 명칭을 입력하세요"
                                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-[#39B54A] focus:ring-[#39B54A]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">이미지 업로드 (16:9 비율 크롭 지원)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#39B54A] hover:file:bg-green-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-[360px] flex flex-col items-center">
                        <span className="block text-sm font-medium text-slate-700 mb-2 w-full">미리보기</span>
                        <div className="w-[320px] h-[180px] bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={32} className="text-slate-300" />
                            )}
                        </div>
                        {(newTitle || newSubtitle) && (
                            <div className="mt-2 text-center">
                                <span className="text-slate-900 font-bold text-sm mr-2">{newTitle}</span>
                                <span className="text-slate-500 text-sm">{newSubtitle}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSaveEvent}
                        disabled={isSaving || !newTitle || !newSubtitle || (!editingId && !croppedBlob)}
                        className={`px-6 py-2.5 rounded-lg text-white font-bold disabled:opacity-50 flex items-center gap-2 ${editingId ? 'bg-[#39B54A] hover:bg-green-600' : 'bg-[#39B54A] hover:bg-green-600'}`}
                    >
                        {isSaving ? '저장 중...' : editingId ? <><Check size={18} /> 슬라이드 수정</> : <><Plus size={18} /> 슬라이드 추가</>}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-slate-800">등록된 슬라이드 목록</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">로딩 중...</div>
                    ) : events.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">등록된 데이터가 없습니다.</div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                                <div className="text-slate-400 cursor-grab active:cursor-grabbing px-2">
                                    <GripVertical size={20} />
                                </div>
                                <div className="w-[120px] h-[67px] rounded-lg overflow-hidden shrink-0 border border-slate-200 relative">
                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <span className="font-bold text-slate-900">{event.title}</span>
                                    <span className="text-slate-500 text-sm">{event.subtitle}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleEdit(event)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="수정"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(event.id, event.image_url)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {selectedFile && (
                <ImageCropper 
                    file={selectedFile} 
                    onCropComplete={handleCropComplete} 
                    onCancel={() => setSelectedFile(null)} 
                />
            )}
        </Container>
    );
};
