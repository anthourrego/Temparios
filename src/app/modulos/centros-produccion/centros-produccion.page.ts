import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CentroProduccionService } from 'src/app/servicios/centro-produccion.service';
import { StorageService } from '../../servicios/storage.service';
import { FuncionesGenerales } from '../../config/funciones/funciones';
import { CambioCentroProduccionService } from 'src/app/config/suscripciones/cambio-centro-produccion.service';

@Component({
	selector: 'app-centros-produccion',
	templateUrl: './centros-produccion.page.html',
	styleUrls: ['./centros-produccion.page.scss'],
})
export class CentrosProduccionPage implements OnInit {

	segmentos: Array<{ titulo: String, valor: String }> = [{
		titulo: 'Centro Producción', valor: 'centro_produccion'
	}, {
		titulo: 'Configuración', valor: 'configuracion'
	}];
	centrosProduccion: Array<object> = [];
	valorDefecto: string = 'centro_produccion';

	constructor(
		private router: Router,
		private centroProduccionService: CentroProduccionService,
		private storage: StorageService,
		private cambioCentroProduccionService: CambioCentroProduccionService
	) { }

	ngOnInit() { }

	ionViewDidEnter() {
		this.obtenerCentrosProd();
	}

	async obtenerCentrosProd() {
		let datos = await this.storage.get('centrosProduccion');
		this.centrosProduccion = [];
		datos = await this.centroProduccionService.desencriptar(JSON.parse(datos));
		console.log(datos);
		this.centrosProduccion = datos.map(it => {
			it.borde = FuncionesGenerales.generarColorAutomatico();
			return it;
		});
	}

	async irCentroProduccion(op) {
		let encryp = await this.centroProduccionService.encriptar({
			CentroProduccion: op.CentroProduccionId,
			cantidad: this.centrosProduccion.length,
			nombre: op.nombreCP
		});
		this.storage.set('centroProduccion', encryp);
		setTimeout(() => {
			this.cambioCentroProduccionService.cambio('centro');
		}, 50);
		this.router.navigateByUrl('/modulos/produccion/actividades');
	}

	async regresar() {
		this.storage.limpiarTodo(true);
	}

	segmentChanged(evento) {
		this.valorDefecto = evento.detail.value;
	}

}
