import React from 'react';
import { Container } from './ui/Container';

const PARTNERS = [
  "/partners/1773279453008_r5nh0k.svg",
  "/partners/1773280634438_8v1gq1.png",
  "/partners/1773280670211_lyhnd1.webp",
  "/partners/1773280682794_bahw05.png",
  "/partners/1773280725490_v9z9bg.svg",
  "/partners/1773280741121_v0hg30.png",
  "/partners/1773280821120_1dgcuh.png",
  "/partners/1773280967778_kwm81g.svg",
  "/partners/1773281107907_yebrz5.webp",
  "/partners/1773281170530_5e4bqk.png",
  "/partners/1773281297036_vv31o7.jpg",
  "/partners/1773281888199_9vhz9k.png",
  "/partners/1773282781619_fdevih.png",
  "/partners/1773283739291_o8gb75.webp",
  "/partners/1773283748985_otvz6l.webp",
  "/partners/1773283796484_m69dls.webp",
  "/partners/Flag_of_Junggu,_Daejeon.svg.png"
];

export const PartnerCarousel: React.FC = () => {
    return (
        <section className="py-2 bg-white overflow-hidden relative z-10">
            <style>
                {`
                    @keyframes infinite-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes infinite-scroll-reverse {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    .animate-infinite-scroll {
                        animation: infinite-scroll 50s linear infinite;
                    }
                    .animate-infinite-scroll-reverse {
                        animation: infinite-scroll-reverse 50s linear infinite;
                    }
                `}
            </style>
            
            
            
            {/* 무한 스크롤 컨테이너 */}
            <div className="relative w-full overflow-hidden flex flex-col gap-10 bg-white before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 md:before:w-32 before:bg-gradient-to-r before:from-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 md:after:w-32 after:bg-gradient-to-l after:from-white after:to-transparent pt-4 pb-8">
                
                {/* 첫 번째 줄: 왼쪽으로 스크롤 (로고 절반) */}
                <div className="flex animate-infinite-scroll w-max items-center">
                    {[...PARTNERS.slice(0, 9), ...PARTNERS.slice(0, 9), ...PARTNERS.slice(0, 9)].map((partnerImage, index) => (
                        <div 
                            key={`row1-${index}`} 
                            className="flex items-center justify-center w-[160px] md:w-[220px] px-6"
                        >
                            <img 
                                src={partnerImage} 
                                alt={`Partner ${index}`} 
                                className="h-10 md:h-14 w-auto object-contain"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    ))}
                </div>

                {/* 두 번째 줄: 오른쪽으로 스크롤 (나머지 로고 절반) */}
                <div className="flex animate-infinite-scroll-reverse w-max items-center">
                    {[...PARTNERS.slice(9), ...PARTNERS.slice(9), ...PARTNERS.slice(9)].map((partnerImage, index) => (
                        <div 
                            key={`row2-${index}`} 
                            className="flex items-center justify-center w-[160px] md:w-[220px] px-6"
                        >
                            <img 
                                src={partnerImage} 
                                alt={`Partner ${index}`} 
                                className="h-10 md:h-14 w-auto object-contain"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
