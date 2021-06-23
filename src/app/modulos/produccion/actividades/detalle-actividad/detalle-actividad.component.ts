import { Component, Input, OnInit } from '@angular/core';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { ActividadesService } from '../../../../servicios/actividades.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';
import { CargadorService } from '../../../../servicios/cargador.service';
import { AgregarActividadesComponent } from '../agregar-actividades/agregar-actividades.component';

@Component({
	selector: 'app-detalle-actividad',
	templateUrl: './detalle-actividad.component.html',
	styleUrls: ['./detalle-actividad.component.scss'],
})
export class DetalleActividadComponent implements OnInit {

	@Input() idGrupo
	detalleActividad: Array<object> = [];
	searching: boolean = true;
	listarAnterior: boolean = false;

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private notificacionesService: NotificacionesService,
		private cargadorService: CargadorService
	) { }

	ngOnInit() {
		this.obtenerInformacion();
	}

	cerrarModal() {
		this.modalController.dismiss(this.listarAnterior);
	}

	slidingDelInvitado(ref) {
		let elem: any = document.getElementById(ref);
		(elem as IonItemSliding).getSlidingRatio().then(numero => {
			if (numero === 1) {
				(elem as IonItemSliding).close();
			} else {
				(elem as IonItemSliding).open("end");
			}
		});
	}

	obtenerInformacion(event?) {
		let datos = { grupoId: this.idGrupo };
		this.searching = true;
		this.actividadesService.informacion(datos, 'CentrosProduccion/obtenerDetalleGrupo').then(({ valido, datos }) => {
			this.detalleActividad = datos;
			if (event) event.target.complete();
			this.searching = false;
		}, err => {
			console.error(err);
			if (event) event.target.complete();
			this.searching = false;
		});
	}

	eliminarActividad({ ActividadOperarioId }) {
		let datos = { ActividadOperarioId, GrupoId: null };
		this.notificacionesService.alerta(`¿Esta seguro de eliminar la actividad?`).then(({ data, role }) => {
			if (role === 'aceptar') {
				this.cargadorService.presentar().then(() => {
					this.actividadesService.informacion(datos, 'CentrosProduccion/eliminarActividadOperario').then(({ valido, msg }) => {
						this.notificacionesService.notificacion(msg);
						if (valido) {
							this.listarAnterior = true;
							this.obtenerInformacion();
						}
						this.cargadorService.ocultar();
					}, () => this.cargadorService.ocultar());
				}, () => this.cargadorService.ocultar());
			}
		});
	}

	async agregarMas() {
		let datos = {
			component: AgregarActividadesComponent,
			componentProps: { idGrupo: this.idGrupo }
		}
		const modal = await this.modalController.create({ ...datos, backdropDismiss: false });
		await modal.present();
		modal.onWillDismiss().then(({ data }) => {
			if (data) {
				this.listarAnterior = true;
				this.obtenerInformacion();
			}
		}, console.error);
	}

}
