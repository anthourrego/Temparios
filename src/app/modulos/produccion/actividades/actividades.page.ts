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
		,*/ { icono: 'refresh', color: 'secondary', accion: 'cambiar-centro' }
		, { icono: 'add', color: 'primary', accion: 'agregar', component: AgregarActividadesComponent }
		, { icono: 'trending-down', color: 'danger', accion: 'parada', component: ParadasComponent }
		/* , { icono: 'car', color: 'warning', accion: 'car' } */
	];
	subject = new Subject();
	tiempo: string = '';
	/* fechaInicial: string = ''; */
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
		private cambioCentroProduccionService: CambioCentroProduccionService
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
			actividades: await this.storage.get('actividades'),
			centroProd: this.dataCentroProduccion['CentroProduccion'],
		}
		this.obtenerInformacion(event, true);
	}

	async presentActionSheet() {
		const actionSheet = await this.actionSheetController.create({
			buttons: [{
				text: 'Reiniciar',
				role: 'destructive',
				icon: 'refresh',
				handler: () => {
					console.log('Proximamente...');
				}
			}, {
				text: 'Eliminar',
				role: 'delete',
				icon: 'trash',
				handler: () => {
					console.log('Proximamente...');
				}
			}]
		});
		await actionSheet.present();
		const { role } = await actionSheet.onDidDismiss();
		console.log('onDidDismiss resolved with role', role);
	}

	async obtenerInformacion(event?, fecha?) {
		this.searching = true;
		if (this.dataQuery['actividades']) {
			this.actividadesService.informacion(this.dataQuery, 'CentrosProduccion/obtenerActividadesAsignadas').then(({ valido, datos, msg }) => {
				datos = datos.map(op => {
					op['valProgress'] = ((+op['CantiRecib'] * 100) / op['CantidadTotal']) / 100;
					return op;
				});
				this.actividades = datos;
				if (event) {
					event.target.complete();
				}
				this.searching = false;
				/* if (fecha) {
					this.fechaInicial = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
				} */
			}, console.error);
		} else {
			this.searching = false;
		}
	}

	async accionBoton({ accion, component }) {
		if (!component) {
			if (accion == 'cambiar-centro') {
				this.router.navigateByUrl('/modulos/centros-produccion');
			} else {
				this.notificacionesService.notificacion("No hay componente disponible");
			}
			return
		}
		const modal = await this.modalController.create({ component, backdropDismiss: false });
		await modal.present();
		modal.onWillDismiss().then(({ data, role }) => {
			if (data && accion == 'agregar') {
				this.obtenerCentroProd(false);
			}
		}, console.error);
	}

	agregarTiempoActividad(opcion) {
		this.searching = true;
		/* let data = {
			OrdeProdOperacionId: opcion['OrdeProdOperacionId'],
			cantidad: 2,
			fechaInicial: this.fechaInicial,
			fechaFinal: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
			estado: 'LC',
			Tipo: 'OP',
			cantidadFinal: opcion['CantidadTotal']
		} */
		/* Datos otro tabla a validar y comentar la asignacion de fechas o eliminar */
		let data = {
			OrdeProdOperacionId: opcion['OrdeProdOperacionId'],
			Cantidad: 2,
			Tipo: 'OPERACION',
		}
		//this.fechaInicial = data.fechaFinal;
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

}
