// Visitor analytics. Measurement IDs are public (they appear in the page source),
// so they live here. Leave an ID empty to disable that tool.
export const GA_MEASUREMENT_ID = 'G-QYH3SJ29ZE'; // GA4, e.g. 'G-XXXXXXXXXX'
export const NAVER_ANALYTICS_ID = '1ddf3f04dcaafa0'; // Naver Analytics (wcs) site ID

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    wcs?: { inflow: (domain?: string) => void; trans: (data: unknown) => void };
    wcs_add?: Record<string, string>;
    wcs_do?: () => void;
  }
}

const isTrackedPath = (pathname: string) => !pathname.startsWith('/admin');

const loadScript = (src: string) => {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
  return script;
};

let initialized = false;
let naverReady = false;
let naverLastPath = '';
let gaLastPath = '';

export const initAnalytics = () => {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (GA_MEASUREMENT_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag.js reads the Arguments object, not an array
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    // page views are sent manually on every route change
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
  }

  if (NAVER_ANALYTICS_ID) {
    window.wcs_add = { wa: NAVER_ANALYTICS_ID };
    loadScript('https://wcs.pstatic.net/wcslog.js').onload = () => {
      window.wcs?.inflow();
      window.wcs_do?.();
      naverReady = true;
      naverLastPath = window.location.pathname + window.location.search;
    };
  }
};

export const trackPageView = (pathname: string, search = '') => {
  if (!isTrackedPath(pathname)) return;

  const path = pathname + search;

  if (GA_MEASUREMENT_ID && window.gtag && path !== gaLastPath) {
    gaLastPath = path;
    window.gtag('event', 'page_view', {
      page_path: pathname + search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  // before the script loads, its onload handler counts the current page
  if (NAVER_ANALYTICS_ID && naverReady && path !== naverLastPath) {
    naverLastPath = path;
    window.wcs_do?.();
  }
};
