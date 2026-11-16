import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.asha.voiceregister',
  appName: 'ASHA Voice Register',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // for dev communication with local relay
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0B4F4A',
      sound: 'beep.wav',
    },
    Geolocation: {
      // Permission configurations
    }
  }
};

export default config;

