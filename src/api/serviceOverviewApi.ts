import { supabase } from '../lib/supabase';

// Reserved banner records reuse the existing image CMS and its access policies.
// These promo records are not hero banners and have no tab assignment.
export const SERVICE_IMAGE_SLOTS = [
    { id: '0a614e11-4ddd-4d21-9400-000000000001', title: '공간·장비', src: '/service-overview/space.webp', alt: '전시 부스와 영상 장비가 설치된 청주오스코 현장' },
    { id: '0a614e11-4ddd-4d21-9400-000000000002', title: '비품·제작물', src: '/service-overview/supplies.webp', alt: '테이블과 의자, 모니터를 배치한 회의실 세팅' },
    { id: '0a614e11-4ddd-4d21-9400-000000000003', title: '인력·운영', src: '/service-overview/operation.webp', alt: '명찰과 안내 자료를 준비하는 학술대회 등록 데스크' },
];
export type ServiceImage = typeof SERVICE_IMAGE_SLOTS[number];

export async function getServiceImages(): Promise<ServiceImage[]> {
    const { data, error } = await supabase.from('banners').select('id,image_url,subtitle')
        .in('id', SERVICE_IMAGE_SLOTS.map(slot => slot.id));
    if (error) throw error;
    return SERVICE_IMAGE_SLOTS.map(slot => {
        const row = data?.find(item => item.id === slot.id);
        return { ...slot, src: row?.image_url || slot.src, alt: row?.subtitle || slot.alt };
    });
}

export async function saveServiceImage(image: ServiceImage): Promise<void> {
    const index = SERVICE_IMAGE_SLOTS.findIndex(slot => slot.id === image.id);
    if (index < 0 || !image.alt.trim() || !image.src) throw new Error('이미지와 설명을 확인해 주세요.');
    const { data, error } = await supabase.from('banners').upsert({
        id: image.id, title: `메인 서비스 소개: ${SERVICE_IMAGE_SLOTS[index].title}`,
        image_url: image.src, subtitle: image.alt.trim(), banner_type: 'promo',
        brand_text: 'service-overview', tab_id: null, link: '/contact', button_text: '',
        display_order: index, is_active: true,
    }).select('id').single();
    if (error) throw error;
    if (!data) throw new Error('저장 결과를 확인하지 못했습니다.');
}
