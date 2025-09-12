import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class AppInfoService {

  constructor() { }

  // Obtener información de la app usando Capacitor App API
  async getAppInfo() {
    try {
      const info = await App.getInfo();
      return {
        name: info.name,
        version: info.version,
        build: info.build,
        id: info.id,
        platform: Capacitor.getPlatform()
      };
    } catch (error) {
      console.error('Error getting app info:', error);
      return {
        name: 'TemparioApp',
        version: '2.3.2',
        build: 'unknown',
        id: 'com.prosof.temparioapp',
        platform: 'web'
      };
    }
  }

  // Método simple para obtener solo la versión
  async getVersion(): Promise<string> {
    try {
      const info = await App.getInfo();
      return info.version;
    } catch (error) {
      return '2.3.2'; // fallback
    }
  }

  // Obtener nombre de la app
  async getAppName(): Promise<string> {
    try {
      const info = await App.getInfo();
      return info.name;
    } catch (error) {
      return 'TemparioApp'; // fallback
    }
  }

  // Obtener build number
  async getBuildNumber(): Promise<string> {
    try {
      const info = await App.getInfo();
      return info.build;
    } catch (error) {
      return 'unknown'; // fallback
    }
  }
}
