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
	productos: Array<object> = [];
	searching: boolean = true;
	mostrarMensajeAgrupada: boolean = false;
	productosGrupo: Array<object> = [];

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private notificacionesService: NotificacionesService,
		private cargadorService: CargadorService
	) { }

	ngOnInit() {
		this.obtenerInformacion();
	}

	cerrarModal(accion?, grupoElimino?) {
		if (grupoElimino) {
			accion = { grupoElimino, accion };
		}
		this.modalController.dismiss(accion);
	}

	confirmar(mensaje: string) {
		this.notificacionesService.alerta(mensaje).then(({ data, role }) => {
			if (role === 'aceptar') {
				this.cargadorService.presentar().then(() => {
					this.finalizarActividades();
				}, () => this.cargadorService.ocultar());
			} else if (role == "cancelar") this.cerrarModal();
		}, console.error);
	}

	obtenerInformacion(event?) {
		let info = {
			ordeprod: this.datos['OrdeProdId'],
			centroprod: this.centroProduccion,
			activiprod: this.datos['ActividadProduccionId'],
			grupo: this.datos['GrupoId'],
			ActividadOperarioId: this.datos['ActividadOperarioId'],
			OperacionId: this.datos['OperacionId']
		};
		if (this.detalleActividad) {
			info['detalle'] = this.detalleActividad;
		}
		this.searching = true;
		this.actividadesService.informacion(info, 'CentrosProduccion/obtenerProductoTerminado').then(({ contMensaje, datos, consumoGrupo }) => {
			this.productos = datos;
			this.mostrarMensajeAgrupada = (this.productos.length == contMensaje ? true : false);
			if ((this.datos['GrupoId'] && this.mostrarMensajeAgrupada) || !this.productos.length) {
				this.confirmar("¿Desea finalizar la actividad?");
			}
			if (consumoGrupo) {
				this.productosGrupo = consumoGrupo;
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
			, grupoId: this.datos['GrupoId']
			, Ultimo: this.datos['Ultimo']
		}
		if (this.datos['GrupoId']) {
			data['consumoGrupo'] = this.productosGrupo;
		}
		console.log("Data ", data);
		this.actividadesService.informacion(data, 'CentrosProduccion/finalizarActividad').then(({ msg, valido, grupoElimino }) => {
			this.cargadorService.ocultar();
			if (!valido) {
				this.notificacionesService.notificacion(msg);
			} else {
				this.cerrarModal(true, grupoElimino);
			}
		}, err => {
			console.error(err);
			this.cargadorService.ocultar();
			this.searching = false;
		}).catch((error) => {
			console.error(error);
			this.cargadorService.ocultar();
			this.searching = false;
		});
	}

}
