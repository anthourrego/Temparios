import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActividadesService } from '../../../../servicios/actividades.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';
import { CargadorService } from '../../../../servicios/cargador.service';
import { AlertInput } from '@ionic/core/dist/types/components/alert/alert-interface';

@Component({
    selector: 'app-producto-terminado',
    templateUrl: './producto-terminado.component.html',
    styleUrls: ['./producto-terminado.component.scss'],
    standalone: false
})
export class ProductoTerminadoComponent implements OnInit {

	@Input() datos;
	@Input() centroProduccion;
	@Input() detalleActividad: boolean;
	productos: Array<object> = [];
	searching: boolean = true;
	mostrarMensajeAgrupada: boolean = false;
	productosGrupo: Array<object> = [];
	productoInvalido: boolean = false;
	datosMontaje: object = {};

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private notificacionesService: NotificacionesService,
		private cargadorService: CargadorService,
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

				let posInd = this.productos.findIndex(it => {
					if (it['lotes'] && it['lotes'].length) {
						let posLote = it['lotes'].findIndex(op => op.checked && +op.InvenActua <= 0)
						return posLote > -1;
					}
					return it['cantireal'] <= 0;
				});

				if (posInd >= 0) {

					mensaje = 'El proceso tiene productos en 0. ¿Desea realizar el descargue?';

					this.notificacionesService.alerta(mensaje).then(({ data, role }) => {
						if (role === 'aceptar') {
							if (this.datosMontaje['DescargaInsumoCero'] == 'S') {
								this.solicitarUsuario();
							} else {
								this.finalizarActividades();
							}
						}
					});

				} else {
					this.cargadorService.presentar().then(() => {
						this.finalizarActividades();
					}, () => this.cargadorService.ocultar());
				}

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
		if (this.datos['descargueInsumo']) {
			info['descargueInsumo'] = 1;
		}
		if (this.datos['cantidadParcial'] && this.datos['cantidadParcial'] > 0) {
			info['cantiParcial'] = this.datos['cantidadParcial'];
		}
		this.searching = true;

		this.actividadesService.informacion(info, 'CentrosProduccion/obtenerProductoTerminado').then(({ contMensaje, datos, consumoGrupo, montaje }) => {
			this.productos = datos;
			this.datosMontaje = montaje;
			this.productos.forEach(it => {
				if (it['ManejaLotes'] == 'S') it['formValido'] = false;
			});
			if (this.datos.dataLista && this.datos.dataLista.length > 0 && this.productos.length > 0) {
				this.productos.forEach((producto: any) => {
					this.datos.dataLista.forEach((lista: any) => {
						if (producto.OrdeProdId === lista.OrdeProdId) {
							producto['cantidadReproceso'] = lista.cantReproceso;
						} else {
							producto['cantidadReproceso'] = 0;
						}
					});
				});
			} else {
				this.productos = this.productos.map(p => ({...p, cantidadReproceso: 0}));
			};
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

	finalizarActividades(extra?) {
		let actFinal = this.productos.map(op => {
			let obj = Object.assign({}, op);
			delete obj['form'];
			return obj;
		});
		let data = {
			actFinal: actFinal
			, OrdeProdOperacionId: this.datos['OrdeProdOperacionId']
			, ordeprodid: this.datos['OrdeProdId']
			, NumerOrden: this.datos['NumerOrden']
			, centroproduccionid: this.centroProduccion
			, grupoId: this.datos['GrupoId']
			, Ultimo: this.datos['Ultimo']
			, GrupoERP: null
			, cantidadOriginalrestante: this.datos['CantidadOriginal'] - this.datos['CantidadParcialEntregada']
		}
		if (this.datos['GrupoId']) {
			let consumoGrupo = this.productosGrupo.map(op => {
				let obj2 = Object.assign({}, op);
				delete obj2['form'];
				return obj2;
			});
			data['consumoGrupo'] = consumoGrupo;
		}
		if (this.datos['GrupoERP'] > 0) {
			data.GrupoERP = this.datos['GrupoERP'];
			data['ContadorGrupoERP'] = this.datos['ContadorGrupo'];
		}

		if (extra) {
			data = { ...data, ...extra };
		}

		if (this.datos['descargueInsumo']) {
			data['descargueInsumo'] = 1;
		}

		if (this.datos['cantidadParcial'] && this.datos['cantidadParcial'] > 0 && this.datos['cantidadParcial'] < (this.datos['CantidadTotal'] - this.datos['CantidadParcialEntregada'])) {
			data['cantiParcial'] = this.datos['cantidadParcial'];
		};

		if (this.datos['dataLista']) {
			data['dataLista'] = this.datos['dataLista'];
		} else {
			data['dataLista'] = [];
		}

		this.actividadesService.informacion(data, 'CentrosProduccion/finalizarActividad').then(({ msg, valido, grupoElimino, respUsuario }) => {
			this.cargadorService.ocultar();

			if (respUsuario) {
				this.notificacionesService.notificacion(msg);
			} else {
				if (!valido) {
					this.notificacionesService.notificacion(msg);
				} else {
					this.notificacionesService.notificacion(msg);
					this.cerrarModal(true, grupoElimino);
				}
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

	validarBoton({ tipo, valor, pos }) {
		if (this.datos['GrupoId']) {
			if (tipo == "form") {
				this.productosGrupo[pos]['formValido'] = valor;
				this.productoInvalido = !this.productosGrupo.find(op => op['ManejaLotes'] == 'S' && !op['formValido']);
			}
		} else {
			if (tipo == "form") {
				this.productos[pos]['formValido'] = valor;
				this.productoInvalido = !this.productos.find(op => op['ManejaLotes'] == 'S' && !op['formValido']);
			}
		}
	}

	solicitarUsuario() {
		let inputs: AlertInput[] = [{
			name: "userVal",
			type: "text",
			placeholder: "Usuario"
		}, {
			name: "passVal",
			type: "password",
			placeholder: "Contraseña"
		}];

		this.notificacionesService.alerta('', 'Autorización Operación en 0', ['alerta-input'], null, inputs).then(({ data, role }) => {
			if (role === 'aceptar') {
				this.cargadorService.presentar().then(() => {
					this.finalizarActividades({ ...data.values, validaUsuario: 1, permiso: 2628 });
				}, () => this.cargadorService.ocultar());
			}
		});
	}

}
