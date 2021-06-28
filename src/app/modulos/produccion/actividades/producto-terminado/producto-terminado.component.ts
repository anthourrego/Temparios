import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActividadesService } from '../../../../servicios/actividades.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';
import { CargadorService } from '../../../../servicios/cargador.service';

@Component({
	selector: 'app-producto-terminado',
	templateUrl: './producto-terminado.component.html',
	styleUrls: ['./producto-terminado.component.scss'],
})
export class ProductoTerminadoComponent implements OnInit {

	@Input() datos;
	@Input() centroProduccion;
	@Input() detalleActividad: boolean;
	productos: Array<object> = [];;
	searching: boolean = true;
	llavesProductos: Object = {};

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private notificacionesService: NotificacionesService,
		private cargadorService: CargadorService
	) { }

	ngOnInit() {
		this.obtenerInformacion();
	}

	cerrarModal(accion?) {
		this.modalController.dismiss(accion);
	}

	confirmar() {
		this.notificacionesService.alerta("¿Desea terminar esta orden de producción?").then(({ data, role }) => {
			if (role === 'aceptar') {
				this.cargadorService.presentar().then(() => {
					this.finalizarActividades();
				}, () => this.cargadorService.ocultar());
			}
		}, console.error);
	}

	obtenerInformacion(event?) {
		let info = {
			ordeprod: this.datos['OrdeProdId'],
			centroprod: this.centroProduccion,
			activiprod: this.datos['ActividadProduccionId'],
			grupo: this.datos['GrupoId'],
			ActividadOperarioId: this.datos['ActividadOperarioId']
		};
		if (this.detalleActividad) {
			info['detalle'] = this.detalleActividad;
		}
		this.searching = true;
		this.actividadesService.informacion(info, 'CentrosProduccion/obtenerProductoTerminado').then(({ valido, datos, info }) => {
			this.productos = datos;
			if (info) {
				this.productos = info;
				this.llavesProductos = JSON.parse(datos);
			}
			if (event) event.target.complete();
			this.searching = false;
		}, err => {
			console.error(err);
			if (event) event.target.complete();
			this.searching = false;
		});
	}

	finalizarActividades() {
		let data = {
			actFinal: this.productos
			, OrdeProdOperacionId: this.datos['OrdeProdOperacionId']
			, ordeprodid: this.datos['OrdeProdId']
			, NumerOrden: this.datos['NumerOrden']
			, centroproduccionid: this.centroProduccion
		}
		if (this.datos['GrupoId']) {
			data.actFinal = this.organizarDatos();
		}
		this.actividadesService.informacion(data, 'CentrosProduccion/finalizarActividad').then(({ msg, datos, valido }) => {
			this.cargadorService.ocultar();
			if (!valido) {
				this.notificacionesService.notificacion(msg);
			} else {
				this.cerrarModal(true);
			}
		}, err => {
			console.error(err);
			this.searching = false;
		});
	}

	organizarDatos() {
		let datos = [];
		this.productos.forEach(it => {
			this.llavesProductos[it['headprodid']].map(op => {
				op['ActividadOperario'] = it['IdActividadOperario'];
				return op;
			});
			datos.push(...this.llavesProductos[it['headprodid']]);
		});
		return datos;
	}

}
