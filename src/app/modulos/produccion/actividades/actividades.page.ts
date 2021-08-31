import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ListaChequeoMultipleComponent } from './lista-chequeo-multiple/lista-chequeo-multiple.component';
import { ListaChequeoComponent } from './lista-chequeo/lista-chequeo.component';

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
		{ icono: 'swap-horizontal', color: 'secondary', accion: 'cambiar-centro' }
		, { icono: 'add', color: 'primary', accion: 'agregar', component: AgregarActividadesComponent }
		, { icono: 'trending-down', color: 'tertiary', accion: 'parada', component: ParadasComponent }
		, { icono: 'close-circle-outline', color: 'danger', accion: 'eliminar-multiple' }
	];
	compoDetalle = DetalleActividadComponent;
	subject = new Subject();
	tiempo: string = '';
	dataQuery: object = {};
	idLogActividad: number;
	idLogActividadSearch: string = '';
	idLogActividadUltimo: string = '';
	dataCentroProduccion: object = {};
	usuarioActual = {};
	codeBase64 = 'data:image/jpeg;base64,';
	count: number = 0;
	actividadesEliminar: Array<object> = [];
	timeoutHandler;
	clickPresionado: boolean = false;
	eliminarMultiple: boolean = false;

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
		this.idLogActividadSearch = '';
		this.idLogActividadUltimo = '';
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
					this.accionBoton({ accion: 'detalle', component: this.compoDetalle }, op);
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
			handler: () => this.peticionActionSheet('eliminar la actividad', [data], 'eliminarActividadOperario')
		});
		const actionSheet = await this.actionSheetController.create({
			buttons
		});
		await actionSheet.present();
		const { role } = await actionSheet.onDidDismiss();
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

	async accionBoton(op, datos?, pos?) {
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
		if (datos && (op['accion'] == 'detalle' || op['accion'] == 'terminado' || op['accion'] == 'lista-chequeo' || op['accion'] == 'lista-chequeo-multiple')) {
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
			if (data) {
				if (data.listachequeo) {
					this.actividades[pos]['AplicoListaChequeo'] = true;
					this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, datos);
					if (data.listar) {
						this.obtenerInformacion(false);
					}
				} else if (data && (op['accion'] == 'agregar' || op['accion'] == 'detalle' || op['accion'] == 'terminado')) {
					this.obtenerCentroProd(false);
				} else {
					this.idLogActividadUltimo = '';
				}
			} else {
				this.idLogActividadUltimo = '';
			}
		}, console.error);
	}

	agregarTiempoActividad(op, cantidad?, pos?) {
		if (!this.searching) {
			this.searching = true;
			this.idLogActividadSearch = op['ActividadOperarioId'] != 0 ? op['ActividadOperarioId'] : op['GrupoId'];
			this.idLogActividadUltimo = op['ActividadOperarioId'] != 0 ? op['ActividadOperarioId'] : op['GrupoId'];
			let data = {
				OrdeProdOperacionId: op['OrdeProdOperacionId'],
				GrupoId: op['GrupoId'],
				Cantidad: op['GrupoId'] == null ? (cantidad ? cantidad : 1) : op['CantidadTotal'],
				Tipo: (op['ListaChequeoId'] ? 'REPROCESO' : 'OPERACION'),
				centroProd: this.dataQuery['centroProd']
			}
			this.actividadesService.informacion(data, 'CentrosProduccion/agregarLogActividad').then(({ datos, msg, valido, actividades }) => {
				this.idLogActividad = datos;
				this.searching = false;
				if (!valido) {
					this.notificacionesService.notificacion(msg);
				} else {
					this.actividades = actividades;
					if ((op['GrupoId'] != null) || ((+op['CantiRecib'] + data.Cantidad) == +op['CantidadTotal'])) {
						op['CantiRecib'] = (+op['CantiRecib'] + data.Cantidad);
						this.ordenOperacionClick(op, pos);
					}
				}
				this.idLogActividadSearch = '';
			}).catch((error) => {
				console.log(error);
				this.searching = false;
			});
		}
	}

	peticionActionSheet(accion, datos, funcion) {
		this.notificacionesService.alerta(`¿Está seguro de ${accion}?`).then(({ data, role }) => {
			if (role === 'aceptar') {
				this.cargadorService.presentar().then(() => {
					this.actividadesService.informacion(datos, 'CentrosProduccion/' + funcion).then(({ valido, msg }) => {
						this.notificacionesService.notificacion(msg);
						if (valido) {
							this.accionEliminarMultiple(true);
							this.obtenerInformacion();
						}
						this.cargadorService.ocultar();
					}).catch((error) => {
						this.cargadorService.ocultar();
						console.log(error);
					});
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

	endCount() {
		if (this.timeoutHandler) {
			this.clickPresionado = !this.clickPresionado;
			clearTimeout(this.timeoutHandler);
			this.timeoutHandler = null;
		}
	}

	startCount(datos) {
		this.clickPresionado = !this.clickPresionado;
		this.timeoutHandler = setTimeout(() => {
			if (this.clickPresionado) {
				this.alertaAgregarCantidad(datos);
			}
		}, 400);
	}

	alertaAgregarCantidad(datos) {
		let cantidadValida = Number(datos.CantidadTotal) - Number(datos.CantiRecib);
		let botones = [{
			text: 'Aceptar',
			handler: (data) => {
				let cantidad = data.cantidad == '' ? 0 : data.cantidad;
				cantidad = Number(cantidad);
				if (cantidad > 0) {
					if (cantidad <= cantidadValida) {
						this.agregarTiempoActividad(datos, cantidad);
					} else {
						this.notificacionesService.notificacion(`Ha superado la cantidad maxima que es ${cantidadValida}`);
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
		this.notificacionesService.alerta(
			`¿Que cantidad desea confirmar? <br> Cantidad máxima ${cantidadValida}`
			, 'Agregar Tiempo'
			, ['alerta-input']
			, botones
			, [{ min: 0, max: cantidadValida, type: "number", name: "cantidad" }]
		);
	}

	accionEliminarMultiple(cancelar?) {
		this.eliminarMultiple = !this.eliminarMultiple;
		if (cancelar) {
			let data = document.getElementsByClassName('data-buttons');
			data.length > 0 ? data[0].classList.remove("show") : null;
			this.eliminarMultiple = false;
		}
		this.actividadesEliminar = [];
		this.actividades.forEach(it => it['eliminarMultiple'] = false);
	}

	async agregarEliminarActividad(op, pos) {
		if (this.eliminarMultiple) {
			if (this.actividades[pos]['eliminarMultiple']) {
				let index = this.actividadesEliminar.findIndex(op2 => op2['ActividadOperarioId'] == op.ActividadOperarioId);
				if (index != -1) {
					this.actividades[pos]['eliminarMultiple'] = false;
					this.actividadesEliminar.splice(index, 1);
				}
			} else {
				this.actividades[pos]['eliminarMultiple'] = true;
				this.actividadesEliminar.push(op);
			}
		} else {
			this.actividadesEliminar = [];
		}
	}

	eliminarActividadesMultiples() {
		let data = [];
		this.actividadesEliminar.forEach(op => {
			data.push({
				ActividadOperarioId: op['ActividadOperarioId'],
				GrupoId: op['GrupoId']
			});
		});
		this.peticionActionSheet('eliminar las actividades', data, 'eliminarActividadOperario');
	}

	ordenOperacionClick(op, pos) {
		if (+op['CantiRecib'] < +op['CantidadTotal']) {
			this.agregarTiempoActividad(op, null, pos);
		} else {
			if (op['GrupoId'] == null) {
				if (op['AplicaListaChequeo']) {
					if (op['AplicoListaChequeo']) {
						this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, op);
					} else {
						this.accionBoton({ accion: 'lista-chequeo', component: ListaChequeoComponent }, op, pos);
					}
				} else {
					this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, op);
				}
			} else {
				if (op['AplicaListaChequeo'] == null) {
					this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, op);
				} else {
					if (op['AplicaListaChequeo'] == 1) {
						this.accionBoton({ accion: 'lista-chequeo', component: ListaChequeoComponent }, op, pos);
					} else {
						this.accionBoton({ accion: 'lista-chequeo-multiple', component: ListaChequeoMultipleComponent }, op, pos);
					}
				}
			}
		}
	}

}
