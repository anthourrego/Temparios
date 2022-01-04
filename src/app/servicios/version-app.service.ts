import { Injectable } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';

@Injectable({
	providedIn: 'root'
})
export class VersionAppService {

	constructor(
		private appVersion: AppVersion
	) { }

	async appName() {
		let name = await this.appVersion.getAppName().then(op => op);
		return name;
	}

	async packageName() {
		let pa = await this.appVersion.getPackageName().then(op => op);
		return pa;
	}

	async versionCode() {
		let ver = await this.appVersion.getVersionCode().then(op => op);
		return ver;
	}

	async versionNUmber() {
		let vn = await this.appVersion.getVersionNumber().then(op => op);
		return vn;
	}

}
