import { Component, OnInit } from '@angular/core';
import { AppInfoService } from 'src/app/servicios/app-info.service';
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
		private appInfoService: AppInfoService,
		private storage: StorageService
	) { }

	ngOnInit() {
		this.obtenerVersion();
	}

	async obtenerVersion() {
		try {
			this.nameApp = await this.appInfoService.getAppName();
			this.versionNumber = await this.appInfoService.getVersion();
			this.storage.set('version', this.versionNumber);
		} catch (error) {
			console.error('Error obteniendo versión:', error);
			// Valores por defecto
			this.nameApp = 'TemparioApp';
			this.versionNumber = '2.3.2';
		}
	}

}
