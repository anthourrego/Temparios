import { Component } from '@angular/core';
import { ThemeService } from './servicios/theme.service';
import { InicioService } from './servicios/inicio.service ';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
})
export class AppComponent {
	constructor(
		private theme: ThemeService,
		private inicio: InicioService
	) { }
}
