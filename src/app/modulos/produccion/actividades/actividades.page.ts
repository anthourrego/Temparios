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
import { CaracteristicasComponent } from './caracteristicas/caracteristicas.component';
import { HeaderService } from 'src/app/servicios/header.service';
import { DateUtilsService } from 'src/app/servicios/date-utils.service';

@Component({
    selector: 'app-actividades',
    templateUrl: './actividades.page.html',
    styleUrls: ['./actividades.page.scss'],
    standalone: false
})
export class ActividadesPage implements OnInit, OnDestroy {

	tituloEficiencia: Array<string> = ['Hora', 'Diaria', 'Mensual'];
	valoresEficiencia: Array<any> = [];
	searching: boolean = true;
	actividadesLista: Array<object> = [];
	botones: Array<object> = [
		{ icono: 'swap-horizontal', color: 'secondary', accion: 'cambiar-centro' }
		, { icono: 'add', color: 'primary', accion: 'agregar', component: AgregarActividadesComponent }
		, { icono: 'trending-down', color: 'tertiary', accion: 'parada', component: ParadasComponent }
		, { icono: 'close-circle-outline', color: 'danger', accion: 'eliminar-multiple' }
	];
	compoDetalle = DetalleActividadComponent;
	compoCaracteristicas = CaracteristicasComponent;
	subject = new Subject();
	tiempo: string = '';
	dataQuery: object = {};
	idLogActividad: number;
	idLogActividadSearch: string = '';
	idLogActividadUltimo: string = '';
	dataCentroProduccion: object = {};
	usuarioActual = {};
	turno = {
		TurnoId: null,
		Nombre: ''
	};
	codeBase64 = 'data:image/jpeg;base64,';
	count: number = 0;
	actividadesEliminar: Array<object> = [];
	timeoutHandler;
	clickPresionado: boolean = false;
	eliminarMultiple: boolean = false;
	ingresoModulo: boolean = true;
	interval: any;

	constructor(
		private actionSheetController: ActionSheetController,
		private modalController: ModalController,
		private notificacionesService: NotificacionesService,
		private actividadesService: ActividadesService,
		private storage: StorageService,
		private router: Router,
		private cambioCentroProduccionService: CambioCentroProduccionService,
		private cargadorService: CargadorService,
		private headerService: HeaderService,
		private dateUtilsService: DateUtilsService,
	) {
		this.cambioCentroProduccionService.suscripcion().pipe(takeUntil(this.subject)).subscribe(respu => {
			this.actividadesLista = [];
			this.ingresoModulo = true;
			this.obtenerCentroProd(false);
		});
	}

	ngOnDestroy() {
		this.subject.next(true);
		clearInterval(this.interval);
	}

	ngOnInit() {
		if (this.valoresEficiencia.length === 0) {
			this.actividadesService.informacion(
				{ modo: 'dia', fecha: this.dateUtilsService.getCurrentDateTime()},
				'CentrosProduccion/Eficiencia'
			).then( resp => {
				if(resp) {
					this.valoresEficiencia = [
						{ valor: resp.hora.Eficiencia == null ? '0' : resp.hora.Eficiencia, color: resp.hora.Color },
						{ valor: resp.dia.Eficiencia == null ? '0' : resp.dia.Eficiencia, color: resp.dia.Color },
						{ valor: resp.mensual.Eficiencia == null ? '0' : resp.mensual.Eficiencia, color: resp.mensual.Color }
					]
				}
			});
		}

		this.interval = setInterval(() => {
			this.actividadesService.informacion(
				{ modo: 'dia', fecha: this.dateUtilsService.getCurrentDateTime()},
				'CentrosProduccion/Eficiencia'
			).then( resp => {
				if(resp) {
					this.valoresEficiencia = [
						{ valor: resp.hora.Eficiencia == null ? '0' : resp.hora.Eficiencia, color: resp.hora.Color },
						{ valor: resp.dia.Eficiencia == null ? '0' : resp.dia.Eficiencia, color: resp.dia.Color },
						{ valor: resp.mensual.Eficiencia == null ? '0' : resp.mensual.Eficiencia, color: resp.mensual.Color }
					]
				}
			});
		}, 900000)
	}

	ionViewDidEnter() {
		this.idLogActividadSearch = '';
		this.idLogActividadUltimo = '';
		this.actividadesLista = [];
		this.obtenerCentroProd(false);
	}

	async obtenerCentroProd(event) {
		this.usuarioActual = await this.actividadesService.desencriptar(JSON.parse(await this.storage.get('usuario')));
		this.turno = JSON.parse(await this.storage.get('turno'));
		this.dataCentroProduccion = await this.actividadesService.desencriptar(JSON.parse(await this.storage.get('centroProduccion')));
		this.dataQuery = {
			centroProd: this.dataCentroProduccion['CentroProduccion'],
			ingresoModulo: this.ingresoModulo
		}
		this.obtenerInformacion(event, true);
	}

	async presentActionSheet(op, pos) {
		let data = {
			ActividadOperarioId: op['ActividadOperarioId'],
			GrupoId: op['GrupoId'],
			centroProd: this.dataCentroProduccion['CentroProduccion'],
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
			if (+op['CantiRecib'] < +op['CantidadTotal']) {
				buttons.push({
					text: 'Pausar',
					icon: 'pause-outline',
					handler: () => {
						let data = {
							OrdeProdOperacionId: op['OrdeProdOperacionId'],
							GrupoId: op['GrupoId'],
							Cantidad: 0,
							Tipo: 'PAUSA',
							contadorGrupo: 0, //op['GrupoERP'],
							centroProd: this.dataQuery['centroProd']
						}
						this.peticionActionSheet('pausar la actividad', data, 'agregarLogActividad', pos)
					}
				});
			}
		}
		if (op['Ultimo'] == '1') {
			buttons.push({
				text: 'Entrega parcial',
				icon: 'bag-add-outline',
				handler: () => {
					if (Number(op.CantidadMinima) > 0) {
						if (op.AplicaListaChequeo) {
							this.accionBoton({ accion: 'terminado', component: ListaChequeoComponent }, op, pos);
						} else {
							this.entregaParcial(op);
						}
					} else {
						this.notificacionesService.notificacion("No tiene cantidad para la entrega");
					}
				}
			});
		}

		if (op['Ultimo'] != '1' && op.PendientesInsumos) {
			buttons.push({
				text: 'Descargar Insumos',
				icon: 'flask-outline',
				handler: () => {
					let info = { ...op, descargueInsumo: true };
					this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, info);
				}
			});
		}

		if ((op['PedidoId'] > 0 && op['tipoPedido'] == 'C') || (op['PedidoId'] > 0 && op['GrupoId'] != null)) {
			buttons.push({
				text: 'Caracteristicas',
				icon: 'list-circle-outline',
				handler: () => this.accionBoton({ accion: 'caracteristicas', component: this.compoCaracteristicas }, op)
			});
		}
		buttons.push({
			text: 'Eliminar',
			icon: 'trash',
			handler: () => this.peticionActionSheet('eliminar la actividad', [data], 'eliminarActividadOperario', pos)
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
				this.storage.remove('turno');
				this.storage.set('turno', JSON.stringify({ TurnoId: datos.turno.TurnoId, Nombre: datos.turno.Nombre }));
				this.turno = datos.turno;
				this.actividadesLista = datos.datos;
				this.mappearCantidadActividades();
			};
			if (event) event.target.complete();
			this.searching = false;
			this.ingresoModulo = false;
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
		if (datos && (op['accion'] == 'detalle' || op['accion'] == 'terminado' || op['accion'] == 'lista-chequeo' || op['accion'] == 'lista-chequeo-multiple') || op['accion'] == 'caracteristicas') {
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
					if (data.dataListasChequeo) {
						let info = { ...datos, dataLista: data.dataListasChequeo };
						this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, info);
					}
					if (data.cantidadParcial > 0) {
						let info = { ...datos, cantidadParcial: data.cantidadParcial, dataLista: [data.dataLista] };
						this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, info);
					}
					if (data.listar) {
						this.obtenerInformacion(false);
					}
				} else if (data.GrupoERP) {
					this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, datos);
					this.obtenerCentroProd(false);
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
				Tipo: (op['EjecucionListaId'] ? 'REPROCESO' : 'OPERACION'),
				centroProd: this.dataQuery['centroProd'],
				contadorGrupo: (op['GrupoERP'] > 0 ? (op['ContadorGrupo'] == 0 ? 0 : 1) : 1)
			}
			this.actividadesService.informacion(data, 'CentrosProduccion/agregarLogActividad').then(({ datos, msg, valido, actividades, turno }) => {
				this.idLogActividad = datos;
				this.storage.remove('turno');
				this.storage.set('turno', JSON.stringify({ TurnoId: turno.TurnoId, Nombre: turno.Nombre }));
				this.turno = turno;
				this.searching = false;
				if (!valido) {
					this.notificacionesService.notificacion(msg);
				} else {
					if (pos >= 0 && actividades[pos] && this.actividadesLista[pos]) {
						this.actividadesLista[pos] = { ...this.actividadesLista[pos], ...actividades[pos] };
						this.mappearCantidadActividades();
					}
					if (((op['GrupoId'] != null) || ((+op['CantiRecib'] + data.Cantidad) == +op['CantidadTotal'])) && op['ContadorGrupo'] != 0) {
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

	peticionActionSheet(accion, datos, funcion, pos?) {
		this.notificacionesService.alerta(`¿Está seguro de ${accion}?`).then(({ data, role }) => {
			if (role === 'aceptar') {
				this.cargadorService.presentar().then(() => {
					this.actividadesService.informacion(datos, 'CentrosProduccion/' + funcion).then(({ msg, valido, actividades }) => {
						this.notificacionesService.notificacion(msg);
						if (valido) {
							this.accionEliminarMultiple(true);
							if (pos >= 0) {
								if (funcion == 'eliminarActividadOperario') {
									this.actividadesLista.splice(pos, 1);
								} else if (actividades && actividades[pos] && this.actividadesLista[pos]) {
									this.actividadesLista[pos] = actividades[pos];
								}
							} else {
								this.actividadesLista = actividades;
							}
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
						let info = { ...datos, cantidadParcial: cantidad };
						this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, info);
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

	startCount(datos, pos) {
		this.clickPresionado = !this.clickPresionado;
		this.timeoutHandler = setTimeout(() => {
			if (this.clickPresionado) {
				this.alertaAgregarCantidad(datos, pos);
			}
		}, 400);
	}

	alertaAgregarCantidad(datos, pos) {
		let cantidadValida = Number(datos.CantidadTotal) - Number(datos.CantiRecib);
		let botones = [{
			text: 'Aceptar',
			handler: (data) => {
				let cantidad = data.cantidad == '' ? 0 : data.cantidad;
				cantidad = Number(cantidad);
				if (cantidad > 0) {
					if (cantidad <= cantidadValida) {
						this.agregarTiempoActividad(datos, cantidad, pos);
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
		this.actividadesLista.forEach(it => it['eliminarMultiple'] = false);
	}

	async agregarEliminarActividad(op, pos) {
		if (this.eliminarMultiple) {
			if (this.actividadesLista[pos]['eliminarMultiple']) {
				let index = this.actividadesEliminar.findIndex(op2 => op2['ActividadOperarioId'] == op.ActividadOperarioId);
				if (index != -1) {
					this.actividadesLista[pos]['eliminarMultiple'] = false;
					this.actividadesEliminar.splice(index, 1);
				}
			} else {
				this.actividadesLista[pos]['eliminarMultiple'] = true;
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
				GrupoId: op['GrupoId'],
				centroProd: this.dataCentroProduccion['CentroProduccion'],
			});
		});
		this.peticionActionSheet('eliminar las actividades', data, 'eliminarActividadOperario');
	}

	ordenOperacionClick(op, pos) {
		if (op['CantidadMinimaReproceso'] > 0) {
			this.notificacionesService.notificacion('Tiene procesos pendientes o en reproceso');
			return;
		}
		if (op['GrupoId'] != null && op['Pausa'] > 0 && +op['CantiRecib'] < +op['CantidadTotal']) {
			this.reanudarOperacionPausada(op, pos);
		} else {
			if (op['GrupoERP'] > 0 && op['ContadorGrupo'] == 0) {
				this.agregarTiempoActividad(op, null, pos);
			} else {
				if (+op['CantiRecib'] < +op['CantidadTotal']) {
					this.agregarTiempoActividad(op, null, pos);
				} else {
					if (op['GrupoId'] == null) {
						if (op['AplicaListaChequeo']) {
							this.accionBoton({ accion: 'lista-chequeo', component: ListaChequeoComponent }, op, pos);
						} else {
							this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, op);
						}
					} else {
						if (op['AplicaListaChequeo'] == null) {
							this.accionBoton({ accion: 'terminado', component: ProductoTerminadoComponent }, op);
						} else {
							if (op['AplicaListaChequeo'] >= 1) {
								this.accionBoton({ accion: 'lista-chequeo-multiple', component: ListaChequeoMultipleComponent }, op, pos);
							}
						}
					}
				}
			}
		}
	}

	reanudarOperacionPausada(op, pos) {
		let botones = [{
			text: 'Aceptar',
			handler: (data) => {
				if (this.actividadesLista[pos]) {
					this.actividadesLista[pos]['Pausa'] = 0;
				}
				this.ordenOperacionClick(op, pos);
			}
		}, {
			text: 'Cancelar',
			role: 'cancel',
			handler: () => console
		}]
		this.notificacionesService.alerta(`¿Desea reanudar la actividad?`, 'Reanudar actividad', [], botones);
	}

	verEficiencia() {
		this.headerService.setRuta('eficiencia');
		this.router.navigateByUrl(`modulos/produccion/eficiencia`);
	}

	mappearCantidadActividades() {
		this.actividadesLista = this.actividadesLista.map((a: any) => ({
			...a,
			CantidadTotal: parseInt(a.CantidadOriginal) + parseInt(a.CantidadReproceso ? a.CantidadReproceso : 0),
			CantidadMinima: a.Ultimo === '0' ? parseInt(a.CantidadReproceso ? a.CantidadReproceso : 0 - a.CantidadMinimaReproceso ? a.CantidadMinimaReproceso : 0) : parseInt(a.CantidadMinimaProceso) - parseInt(a.CantidadMinimaReproceso ? a.CantidadMinimaReproceso : 0)
		}));
	}

}
