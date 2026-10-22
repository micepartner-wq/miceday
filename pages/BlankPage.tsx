import React from 'react';
import { Seo } from '../components/seo/Seo';
import { Container } from '../components/ui/Container';
import { NOINDEX_ROBOTS } from '../src/seo';
import { Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BlankPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="페이지 준비중 | 행사어때"
        description="행사어때의 신규 페이지 준비중입니다."
        canonical="/blank"
        robots={NOINDEX_ROBOTS}
      />
      <div className="pt-32 pb-24 bg-slate-50 min-h-[70vh] flex items-center">
        <Container>
          <div className="text-center py-24 px-6 max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#39B54A] to-[#268a33]"></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
              <Wrench size={36} className="text-slate-400" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              서비스 준비중입니다
            </h1>
            
            <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
              보다 나은 서비스를 제공하기 위해<br/>
              현재 페이지를 준비하고 있습니다. 조금만 기다려주세요!
            </p>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </Container>
      </div>
    </>
  );
};
