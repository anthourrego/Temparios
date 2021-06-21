import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

	segmentos: Array<{ titulo: String, valor: String }> = [{
		titulo: 'Actividades', valor: 'actividades'
	}, {
		titulo: 'Historial', valor: 'historial'
	}, {
		titulo: 'Configuración', valor: 'configuracion'
	}];
	valorDefecto: string;

	constructor(
		private router: Router
	) {
		this.valorDefecto = this.router.url.replace('/modulos/produccion/', '');
	}

	ngOnInit() { }

	segmentChanged({ detail }) {
		this.valorDefecto = detail.value;
		this.router.navigateByUrl(`modulos/produccion/${detail.value}`)
	}

}
