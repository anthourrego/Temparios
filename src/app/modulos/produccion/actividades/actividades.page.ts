import { Component, ComponentFactoryResolver, OnDestroy, OnInit } from '@angular/core';
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
import { ProductoTerminadoComponent } from './producto-terminado/producto-terminado.component';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-actividades',
	templateUrl: './actividades.page.html',
	styleUrls: ['./actividades.page.scss'],
})
export class ActividadesPage implements OnInit, OnDestroy {

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
	compoDetalle = DetalleActividadComponent;
	compoTerminado = ProductoTerminadoComponent;
	subject = new Subject();
	tiempo: string = '';
	dataQuery: object = {};
	idLogActividad: number;
	dataCentroProduccion: object = {};
	usuarioActual = {};
	codeBase64 = 'data:image/jpeg;base64,';

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
		this.cambioCentroProduccionService.suscripcion().pipe(takeUntil(this.subject)).subscribe(respu => {
			this.actividades = [];
			this.obtenerCentroProd(false);
		});
	}

	ngOnDestroy() {
		this.subject.next(true);
	}

	ngOnInit() { }

	ionViewDidEnter() {
		this.actividades = [];
		this.obtenerCentroProd(false);
	}

	async obtenerCentroProd(event) {
		this.usuarioActual = await this.actividadesService.desencriptar(JSON.parse(await this.storage.get('usuario')));
		this.dataCentroProduccion = await this.actividadesService.desencriptar(JSON.parse(await this.storage.get('centroProduccion')));
		this.dataQuery = {
			centroProd: this.dataCentroProduccion['CentroProduccion'],
		}
		this.obtenerInformacion(event, true);
	}

	async presentActionSheet(op) {
		let data = {
			ActividadOperarioId: op['ActividadOperarioId'],
			GrupoId: op['GrupoId']
		};
		let buttons = [];
		if (op['GrupoId'] != null) {
			buttons.push({
				text: 'Ver referencias',
				icon: 'eye-outline',
				handler: () => {
					this.accionBoton({accion: 'detalle', component: this.compoDetalle}, op);
				}
			});
		}

		if (op['Ultimo'] == '1') {
			buttons.push({
				text: 'Entrega parcial',
				icon: 'bag-add-outline',
				handler: () => {
					if (Number(op.CantidadMinima) > 0) {
						this.entregaParcial(op);
					} else {
						this.notificacionesService.notificacion("No tiene cantidad para la entrega");
					}
				}
			});
		}

		buttons.push({
			text: 'Eliminar',
			icon: 'trash',
			handler: () => this.peticionActionSheet('eliminar', data)
		});

		const actionSheet = await this.actionSheetController.create({
			buttons
		});
		await actionSheet.present();
		const { role } = await actionSheet.onDidDismiss();
		console.log('onDidDismiss resolved with role', role);
	}

	async obtenerInformacion(event?, fecha?) {
		this.searching = true;
		this.actividadesService.informacion(this.dataQuery, 'CentrosProduccion/obtenerActividadesAsignadas').then((datos) => {
			if (datos) {
				this.actividades = datos.datos;
			}
			if (event) event.target.complete();
			this.searching = false;
		}).catch((error) => {
			if (event) event.target.complete();
			this.searching = false;
			console.log(error);
		});
	}

	async accionBoton(op, datos?) {
		if (!op['component']) {
			if (op['accion'] == 'cambiar-centro') {
				this.router.navigateByUrl('/modulos/centros-produccion');
			} else {
				this.notificacionesService.notificacion("No hay componente disponible");
			}
			return
		}
		let componentProps = {
			centroProduccion: this.dataQuery['centroProd'],
			nombreCp: this.dataCentroProduccion['nombre']
		};
		if (datos && (op['accion'] == 'detalle' || op['accion'] == 'terminado')) {
			if (datos['GrupoId']) {
				componentProps['idGrupo'] = datos['GrupoId']
			}
			componentProps['datos'] = datos;
		}
		const modal = await this.modalController.create({
			component: op['component']
			, backdropDismiss: false
			, componentProps
		});
		await modal.present();
		modal.onWillDismiss().then(({ data, role }) => {
			if (data && (op['accion'] == 'agregar' || op['accion'] == 'detalle' || op['accion'] == 'terminado')) {
				this.obtenerCentroProd(false);
			}
		}, console.error);
	}

	agregarTiempoActividad(op) {
		this.searching = true;
		let data = {
			OrdeProdOperacionId: op['OrdeProdOperacionId'],
			GrupoId: op['GrupoId'],
			Cantidad: op['GrupoId'] == null ? 1 : op['CantidadTotal'],
			Tipo: 'OPERACION',
			centroProd: this.dataQuery['centroProd']
		}
		this.actividadesService.informacion(data, 'CentrosProduccion/agregarLogActividad').then(({ datos, msg, valido, actividades }) => {
			this.idLogActividad = datos;
			this.searching = false;
			if (!valido) {
				this.notificacionesService.notificacion(msg);
			} else {
				this.actividades = actividades;
				if (op['GrupoId'] != null) {
					this.accionBoton({ accion: 'terminado', component: this.compoTerminado }, op)
				}
			}
		}).catch((error) => {
			console.log(error);
			this.searching = false;
		});
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

	entregaParcial(datos) {
		let botones = [{
			text: 'Entregar',
			handler: (data) => {
				let cantidad = data.cantidad == '' ? 0 : data.cantidad;
				cantidad = Number(cantidad);
				if (cantidad > 0) {
					if (cantidad <= datos.CantidadMinima) {
						this.cargadorService.presentar().then(() => {
							let datico = {
								ordeProdId: datos['OrdeProdId']
								, centroProdId: this.dataQuery['centroProd']
								, Cantidad: cantidad
							}

							this.actividadesService.informacion(datico, 'CentrosProduccion/entregaParcial').then((datos) => {
								this.actividades = datos.actividades;
								this.notificacionesService.notificacion(datos.msg);
								this.cargadorService.ocultar();
							}).catch((error) => {
								this.cargadorService.ocultar();
								console.log(error);
							});
						}, () => this.cargadorService.ocultar());

					} else {
						this.notificacionesService.notificacion(`Ha superado la cantidad maxima a entregar ${Number(datos.CantidadMinima)}`);
						return false;
					}
				} else {
					this.notificacionesService.notificacion("La cantidad debe ser mayor a 0.");
					return false;
				}
			}
		}, {
			text: 'Cancelar',
			role: 'cancel'
		}]
		this.notificacionesService.alerta(`¿Que cantidad desea entregar? <br> Cantidad máxima ${Number(datos.CantidadMinima)}`, 'Entrega parcial', ['alerta-input'], botones, [{ min: 0, max: 10, type: "number", name: "cantidad" }]);
	}

}
