import { Component, OnInit } from '@angular/core';
import { VersionAppService } from 'src/app/servicios/version-app.service';

@Component({
	selector: 'app-footer-version',
	templateUrl: './footer-version.component.html',
	styleUrls: ['./footer-version.component.scss'],
})
export class FooterVersionComponent implements OnInit {

	nameApp: any;
	versionNumber: any;

	constructor(
		private appVersion: VersionAppService
	) { }

	ngOnInit() {
		this.obtenerVersion();
	}

	async obtenerVersion() {
		this.nameApp = this.appVersion.appName();
		this.versionNumber = this.appVersion.versionNUmber();
	}

}
