import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.co.miceday.app',
  appName: '행사어때',
  webDir: 'www',
  server: {
    url: 'https://miceday.co.kr',
    cleartext: false
  }
};

export default config;
