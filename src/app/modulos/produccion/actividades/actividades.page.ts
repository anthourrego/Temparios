import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { AgregarActividadesComponent } from './agregar-actividades/agregar-actividades.component';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { ActividadesService } from '../../../servicios/actividades.service';
import { StorageService } from '../../../servicios/storage.service';
import { ParadasComponent } from './paradas/paradas.component';
import { Router } from '@angular/router';
import { CambioCentroProduccionService } from 'src/app/config/suscripciones/cambio-centro-produccion.service';
import { DetalleActividadComponent } from './detalle-actividad/detalle-actividad.component';
import { CargadorService } from '../../../servicios/cargador.service';

@Component({
	selector: 'app-actividades',
	templateUrl: './actividades.page.html',
	styleUrls: ['./actividades.page.scss'],
})
export class ActividadesPage implements OnInit {

	tituloEficiencia: Array<string> = ['Hora', 'Diaria', 'Mensual'];
	valoresEficiencia: Array<string> = ['0%', '0%', '0%'];
	searching: boolean = true;
	actividades: Array<object> = [];
	botones: Array<object> = [
		/* { icono: 'home', color: 'success', accion: 'home' }
		,*/ { icono: 'swap-horizontal', color: 'secondary', accion: 'cambiar-centro' }
		, { icono: 'add', color: 'primary', accion: 'agregar', component: AgregarActividadesComponent }
		, { icono: 'trending-down', color: 'danger', accion: 'parada', component: ParadasComponent }
		/* , { icono: 'car', color: 'warning', accion: 'car' } */
	];
	componente = DetalleActividadComponent;
	subject = new Subject();
	tiempo: string = '';
	dataQuery: object = {};
	idLogActividad: number;
	dataCentroProduccion: object = {};

	constructor(
		private actionSheetController: ActionSheetController,
		private modalController: ModalController,
		private notificacionesService: NotificacionesService,
		private actividadesService: ActividadesService,
		private storage: StorageService,
		private router: Router,
		private cambioCentroProduccionService: CambioCentroProduccionService,
		private cargadorService: CargadorService
	) {
		this.cambioCentroProduccionService.suscripcion().subscribe(respu => {
			this.actividades = [];
			this.obtenerCentroProd(false);
		});
	}

	ngOnInit() { }

	ionViewDidEnter() {
		this.actividades = [];
		this.obtenerCentroProd(false);
	}

	async obtenerCentroProd(event) {
		this.dataCentroProduccion = this.actividadesService.desencriptar(JSON.parse(await this.storage.get('centroProduccion')));
		this.dataQuery = {
			centroProd: this.dataCentroProduccion['CentroProduccion'],
		}
		this.obtenerInformacion(event, true);
	}

	async presentActionSheet({ ActividadOperarioId, GrupoId }) {
		let data = { ActividadOperarioId, GrupoId };
		const actionSheet = await this.actionSheetController.create({
			buttons: [{
				text: 'Reiniciar',
				icon: 'refresh',
				handler: () => this.peticionActionSheet('reiniciar', data)
			}, {
				text: 'Eliminar',
				icon: 'trash',
				handler: () => this.peticionActionSheet('eliminar', data)
			}]
		});
		await actionSheet.present();
		const { role } = await actionSheet.onDidDismiss();
		console.log('onDidDismiss resolved with role', role);
	}

	async obtenerInformacion(event?, fecha?) {
		this.searching = true;
		this.actividadesService.informacion(this.dataQuery, 'CentrosProduccion/obtenerActividadesAsignadas').then(({ valido, datos, msg }) => {
			this.actividades = datos;
			if (event) {
				event.target.complete();
			}
			this.searching = false;
		}, console.error);
	}

	async accionBoton({ accion, component }, datos?) {
		if (!component) {
			if (accion == 'cambiar-centro') {
				this.router.navigateByUrl('/modulos/centros-produccion');
			} else {
				this.notificacionesService.notificacion("No hay componente disponible");
			}
			return
		}
		let componentProps = {};
		if (datos && datos['GrupoId'] && accion != 'agregar') {
			componentProps['idGrupo'] = datos['GrupoId']
		}
		const modal = await this.modalController.create({
			component
			, backdropDismiss: false
			, componentProps
		});
		await modal.present();
		modal.onWillDismiss().then(({ data, role }) => {
			if (data && (accion == 'agregar' || accion == 'detalle')) {
				this.obtenerCentroProd(false);
			}
		}, console.error);
	}

	agregarTiempoActividad({ OrdeProdOperacionId, GrupoId }) {
		this.searching = true;
		let data = {
			OrdeProdOperacionId, GrupoId,
			Cantidad: 1,
			Tipo: 'OPERACION'
		}
		this.actividadesService.informacion(data, 'CentrosProduccion/agregarLogActividad').then(({ datos, msg, valido }) => {
			this.idLogActividad = datos;
			if (!valido) {
				this.notificacionesService.notificacion(msg);
			} else {
				this.obtenerInformacion(false, false);
			}
			this.searching = false;
		}, console.error);
	}

	peticionActionSheet(accion, datos) {
		this.notificacionesService.alerta(`¿Esta seguro de ${accion} la actividad?`).then(({ data, role }) => {
			if (role === 'aceptar') {
				this.cargadorService.presentar().then(() => {
					this.actividadesService.informacion(datos, 'CentrosProduccion/eliminarActividadOperario').then(({ valido, msg }) => {
						this.notificacionesService.notificacion(msg);
						if (valido) {
							this.obtenerInformacion();
						}
						this.cargadorService.ocultar();
					}, () => this.cargadorService.ocultar());
				}, () => this.cargadorService.ocultar());
			}
		});
	}

}
