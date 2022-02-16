import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { StorageService } from 'src/app/servicios/storage.service';

@Component({
	selector: 'app-footer-version',
	templateUrl: './footer-version.component.html',
	styleUrls: ['./footer-version.component.scss'],
})
export class FooterVersionComponent implements OnInit {

	nameApp: string = "";
	versionNumber: string = ""

	constructor(
		private appVersion: AppVersion,
		private storage: StorageService
	) { }

	ngOnInit() {
		this.obtenerVersion();
	}

	async obtenerVersion() {
		this.appVersion.getAppName().then(op => this.nameApp = op);
		this.appVersion.getVersionNumber().then(op => {
			this.versionNumber = op;
			this.storage.set('version', this.versionNumber);
		});
	}

}
