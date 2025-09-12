import { App } from '@capacitor/app';

export class AppVersionService {

  async getAppInfo() {
    try {
      const info = await App.getInfo();
      return {
        name: info.name,
        id: info.id,
        version: info.version,
        build: info.build
      };
    } catch (error) {
      console.error('Error getting app info:', error);
      return null;
    }
  }

  async getAppVersion(): Promise<string> {
    const info = await App.getInfo();
    return info.version;
  }

  async getAppName(): Promise<string> {
    const info = await App.getInfo();
    return info.name;
  }

  async getBuildNumber(): Promise<string> {
    const info = await App.getInfo();
    return info.build;
  }

  async getPackageName(): Promise<string> {
    const info = await App.getInfo();
    return info.id;
  }
}
