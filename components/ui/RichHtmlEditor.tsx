import React, { useEffect, useRef, useState } from 'react';
import { Bold, Check, Image as ImageIcon, Italic, Loader2, Underline } from 'lucide-react';
import { uploadImage } from '../../src/api/storageApi';

interface RichHtmlEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  featuredImageUrl?: string;
  onFeaturedImageSelect?: (imageUrl: string) => void;
  enableFeaturedImageSelect?: boolean;
  placeholder?: string;
  imageFolder?: string;
  className?: string;
  minHeightClassName?: string;
}

export const RichHtmlEditor: React.FC<RichHtmlEditorProps> = ({
  initialValue,
  onChange,
  featuredImageUrl,
  onFeaturedImageSelect,
  enableFeaturedImageSelect = false,
  placeholder = '내용을 입력해주세요.',
  imageFolder = 'description-images',
  className = '',
  minHeightClassName = 'min-h-[220px]',
}) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [htmlValue, setHtmlValue] = useState(initialValue);
  const [hoveredImage, setHoveredImage] = useState<{ src: string; top: number; left: number } | null>(null);
  const [featuredBadgePosition, setFeaturedBadgePosition] = useState<{ top: number; left: number } | null>(null);

  const syncFeaturedImageMarker = () => {
    if (!contentRef.current) return;

    const imageElements = Array.from(contentRef.current.querySelectorAll('img'));
    let featuredImageElement: HTMLImageElement | null = null;

    imageElements.forEach((img) => {
      const src = img.getAttribute('src') || '';
      const matches = Boolean(featuredImageUrl) && src === featuredImageUrl;
      if (matches) {
        featuredImageElement = img;
      }
      img.setAttribute('data-editor-featured', matches ? 'true' : 'false');
    });

    if (!featuredImageElement || !shellRef.current) {
      setFeaturedBadgePosition(null);
      return;
    }

    const shellRect = shellRef.current.getBoundingClientRect();
    const imageRect = featuredImageElement.getBoundingClientRect();

    setFeaturedBadgePosition({
      top: imageRect.top - shellRect.top + 8,
      left: imageRect.right - shellRect.left - 122,
    });
  };

  useEffect(() => {
    if (!contentRef.current) return;

    if (contentRef.current.innerHTML !== initialValue) {
      contentRef.current.innerHTML = initialValue || '';
    }
    setHtmlValue(initialValue || '');
    syncFeaturedImageMarker();
  }, [initialValue]);

  useEffect(() => {
    syncFeaturedImageMarker();
  }, [featuredImageUrl]);

  useEffect(() => {
    const handleWindowScroll = () => syncFeaturedImageMarker();
    const handleWindowResize = () => syncFeaturedImageMarker();

    window.addEventListener('scroll', handleWindowScroll, true);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('scroll', handleWindowScroll, true);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [featuredImageUrl, htmlValue]);

  const handleInput = () => {
    const nextValue = contentRef.current?.innerHTML || '';
    setHtmlValue(nextValue);
    onChange(nextValue);
    syncFeaturedImageMarker();
  };

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    contentRef.current?.focus();
  };

  const uploadAndInsertImages = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadImage(file, imageFolder);
        execCmd('insertHTML', `<p><img src="${url}" alt="" style="max-width:100%;height:auto;" /></p>`);
      }
    } catch (error) {
      console.error('Failed to upload editor image:', error);
      alert('본문 이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      setDragOver(false);
    }
  };

  const handleImageInsert = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));
      await uploadAndInsertImages(imageFiles);
    };
    input.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith('image/'));
    if (droppedFiles.length === 0) return;

    const selection = window.getSelection();
    const dropRange =
      (document as Document & {
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
      }).caretRangeFromPoint?.(event.clientX, event.clientY) || null;

    if (selection && dropRange) {
      selection.removeAllRanges();
      selection.addRange(dropRange);
    }

    contentRef.current?.focus();
    await uploadAndInsertImages(droppedFiles);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableFeaturedImageSelect || !shellRef.current) return;

    const target = event.target as HTMLElement | null;
    
    if (target?.closest('button[data-editor-action="featured-image"]')) {
      return;
    }

    const imageElement = target?.closest('img');
    if (!imageElement || !contentRef.current?.contains(imageElement)) {
      setHoveredImage(null);
      return;
    }

    const shellRect = shellRef.current.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();
    setHoveredImage({
      src: imageElement.getAttribute('src') || '',
      top: imageRect.top - shellRect.top + 8,
      left: imageRect.right - shellRect.left - 110,
    });
  };

  const handleSelectFeaturedImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!hoveredImage?.src || !onFeaturedImageSelect) return;
    onFeaturedImageSelect(hoveredImage.src);
    setHoveredImage(null);
  };

  const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableFeaturedImageSelect || !onFeaturedImageSelect) return;

    const target = event.target as HTMLElement | null;
    const imageElement = target?.closest('img');
    
    if (imageElement && contentRef.current?.contains(imageElement)) {
      const src = imageElement.getAttribute('src');
      if (src) {
        onFeaturedImageSelect(src);
      }
    }
  };

  const isEmpty =
    !htmlValue ||
    htmlValue === '<br>' ||
    htmlValue === '<div><br></div>' ||
    htmlValue === '<p><br></p>';

  return (
    <div
      ref={shellRef}
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-white ${className} ${
        dragOver ? 'ring-2 ring-[#39B54A]/30' : ''
      }`}
    >
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2">
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="rounded p-2 text-slate-700 transition-colors hover:bg-slate-200"
          title="굵게"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="rounded p-2 text-slate-700 transition-colors hover:bg-slate-200"
          title="기울임"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="rounded p-2 text-slate-700 transition-colors hover:bg-slate-200"
          title="밑줄"
        >
          <Underline size={16} />
        </button>
        <div className="mx-1 h-5 w-px bg-slate-300" />
        <button
          type="button"
          onClick={handleImageInsert}
          disabled={uploading}
          className="flex items-center gap-1 rounded p-2 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          title="이미지 삽입"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          <span className="text-xs font-medium">이미지</span>
        </button>
      </div>

      <div
        className={`relative bg-white ${minHeightClassName}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredImage(null)}
        onClick={handleEditorClick}
      >
        {isEmpty && (
          <div className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400">
            {placeholder}
          </div>
        )}
        {dragOver ? (
          <div className="pointer-events-none absolute inset-3 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-[#39B54A] bg-[#39B54A]/5 text-sm font-semibold text-[#2F9A3F]">
            이미지를 드래그해서 본문에 바로 업로드하세요.
          </div>
        ) : null}
        {enableFeaturedImageSelect && hoveredImage?.src && hoveredImage.src !== featuredImageUrl ? (
          <button
            type="button"
            data-editor-action="featured-image"
            onMouseDown={handleSelectFeaturedImage}
            onClick={handleSelectFeaturedImage}
            className="absolute z-30 flex items-center gap-1 rounded-md bg-black/80 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black shadow-lg"
            style={{ top: hoveredImage.top, left: hoveredImage.left }}
          >
            <Check size={12} />
            대표이미지로 선택
          </button>
        ) : null}
        {enableFeaturedImageSelect && featuredBadgePosition ? (
          <div
            className="pointer-events-none absolute z-20 flex items-center gap-1 rounded-md bg-[#39B54A] px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg"
            style={{ top: featuredBadgePosition.top, left: featuredBadgePosition.left }}
          >
            <Check size={12} />
            대표이미지
          </div>
        ) : null}
        <div
          ref={contentRef}
          data-case-editor={imageFolder === 'installation-cases' ? true : undefined}
          className={`prose prose-sm max-w-none p-4 outline-none [&_img]:max-w-full [&_img]:h-auto ${
            enableFeaturedImageSelect
              ? '[&_img[data-editor-featured="true"]]:outline [&_img[data-editor-featured="true"]]:outline-4 [&_img[data-editor-featured="true"]]:outline-[#39B54A]'
              : ''
          } ${minHeightClassName}`}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
        />
      </div>
    </div>
  );
};
