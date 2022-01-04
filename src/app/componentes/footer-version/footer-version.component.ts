import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';

@Component({
	selector: 'app-footer-version',
	templateUrl: './footer-version.component.html',
	styleUrls: ['./footer-version.component.scss'],
})
export class FooterVersionComponent implements OnInit {

	nameApp: string = "";
	versionNumber: string = ""

	constructor(
		private appVersion: AppVersion
	) { }

	ngOnInit() {
		this.obtenerVersion();
	}

	async obtenerVersion() {
		this.appVersion.getAppName().then(op => this.nameApp = op);
		/* this.appVersion.getPackageName().then(op => { console.log(op) });
		this.appVersion.getVersionCode().then(op => { console.log(op) }); */
		this.appVersion.getVersionNumber().then(op => this.versionNumber = op);
	}

}
