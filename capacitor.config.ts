import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cs.prosof.TemparioApp',
  appName: 'TemparioApp',
  webDir: 'www',
  android: {
    allowMixedContent: true,
    // Configuraciones adicionales para Android
    webContentsDebuggingEnabled: true,
    useLegacyBridge: false
  },
  server: {
    // Permitir navegación a dominios específicos
    /* allowNavigation: [
      'http://192.168.0.224:8016',
      'https://localhost',
      'http://localhost',
      'https://prosof.co:8011',
      'http://prosof.co:8017'
    ], */
    cleartext: true,
    // Configuración adicional para desarrollo
    androidScheme: 'http', // Usar HTTP en desarrollo para evitar Mixed Content
    iosScheme: 'ionic'
  }
};

export default config;
