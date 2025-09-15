import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/servicios/header.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit {

	segmentos: Array<{ titulo: String, valor: String }> = [{
		titulo: 'Actividades', valor: 'actividades'
	}, {
		titulo: 'Historial', valor: 'historial'
	}, {
		titulo: 'Eficiencia', valor: 'eficiencia'
	}, {
		titulo: 'Configuración', valor: 'configuracion'
	}];
	valorDefecto: string;

	constructor(
		private router: Router,
		private headerService: HeaderService
	) {
		this.valorDefecto = this.router.url.replace('/modulos/produccion/', '');
	}

	ngOnInit() {
		this.headerService.rutaActiva$.subscribe((value: string) => {
			this.valorDefecto = value;
		})
	}

	segmentChanged(event) {
		this.headerService.setRuta(event.detail.value);
		this.router.navigateByUrl(`modulos/produccion/${event.detail.value}`)
	}

}
