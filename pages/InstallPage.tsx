import React from 'react';
import { Helmet } from 'react-helmet-async';

const APK_URL = 'https://rentalpartner.kr/app/haengsaeottae.apk?v=1.2';

const STEPS = [
  <>아래 <strong>"앱 다운로드"</strong> 버튼 누르기</>,
  <>다운로드된 파일을 열고 <strong>설치</strong> 누르기 ("출처를 알 수 없는 앱" 허용이 필요할 수 있어요)</>,
  <>설치가 끝나면 "행사어때" 아이콘으로 실행</>,
  <>처음 열면 계정으로 로그인</>,
];

export const InstallPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-10">
    <Helmet>
      <title>행사어때 앱 설치</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(22,101,52,0.12)] px-7 py-9 text-center">
      <img
        src="/app-icon.png"
        alt="행사어때"
        className="w-20 h-20 mx-auto rounded-[22px] shadow-lg"
      />
      <h1 className="mt-6 text-xl font-bold text-gray-900">행사어때 앱 설치</h1>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">
        행사 서비스를 휴대폰에서 바로 확인하는 앱이에요.
        <br />
        아래 순서대로 홈 화면에 설치해 주세요.
      </p>

      <ol className="mt-6 text-left bg-gray-50 border border-gray-200 rounded-2xl px-5 py-5 space-y-3 text-sm text-gray-700">
        {STEPS.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-semibold">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <a
        href={APK_URL}
        className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/30 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        앱 다운로드 (안드로이드)
      </a>
      <p className="mt-3 text-xs text-gray-500">
        안드로이드 폰에서 눌러 주세요. PC에서 열었다면 아래 QR로 폰에서 열어 주세요.
      </p>

      <div className="mt-6 inline-block p-4 border border-gray-200 rounded-2xl">
        <img src="/install-qr.png" alt="설치 페이지 QR 코드" className="w-40 h-40" />
      </div>
      <p className="mt-3 text-xs text-gray-400">다른 기기(폰)로 이 QR을 스캔해도 같은 페이지가 열려요</p>
      <p className="mt-1 text-xs text-gray-400">아이폰은 사파리에서 열어 "홈 화면에 추가"를 이용해 주세요.</p>
    </div>
  </div>
);
