import { Component } from '@angular/core';
import { ThemeService } from './servicios/theme.service';
import { InicioService } from './servicios/inicio.service ';
import { EficienciaService } from './servicios/eficiencia.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: false
})
export class AppComponent {
	constructor(
		private theme: ThemeService,
		private inicio: InicioService,
		private eficienciaService: EficienciaService
	) { }
}
