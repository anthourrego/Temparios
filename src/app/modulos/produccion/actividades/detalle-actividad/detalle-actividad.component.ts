import { Component, Input, OnInit } from '@angular/core';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { ActividadesService } from '../../../../servicios/actividades.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';
import { CargadorService } from '../../../../servicios/cargador.service';
import { AgregarActividadesComponent } from '../agregar-actividades/agregar-actividades.component';
import { ProductoTerminadoComponent } from '../producto-terminado/producto-terminado.component';

@Component({
    selector: 'app-detalle-actividad',
    templateUrl: './detalle-actividad.component.html',
    styleUrls: ['./detalle-actividad.component.scss'],
    standalone: false
})
export class DetalleActividadComponent implements OnInit {

	@Input() datos;
	@Input() idGrupo;
	@Input() centroProduccion;
	detalleActividad: Array<object> = [];
	searching: boolean = true;
	listarAnterior: boolean = false;
	valueBuscador: string = '';

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private notificacionesService: NotificacionesService,
		private cargadorService: CargadorService
	) { }

	ngOnInit() {
		this.obtenerInformacion();
	}

	cerrarModal(datos?) {
		this.modalController.dismiss(datos || this.listarAnterior);
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
		let datos = {
			grupoId: this.idGrupo
			, centroProd: this.centroProduccion
			, actProd: this.datos['ActividadProduccionId']
		};
		this.searching = true;
		this.actividadesService.informacion(datos, 'CentrosProduccion/obtenerDetalleGrupo').then(({ valido, datos }) => {
			this.detalleActividad = datos.map(o => ({...o, CantidadTotal: parseInt(o.CantidadTotal) + parseInt(o.CantidadReproceso)}));
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
			componentProps: { idGrupo: this.idGrupo, centroProduccion: this.centroProduccion }
		}
		this.abrirlModal(datos);
	}

	finalizarActividad(opcion) {
		let datos = {
			component: ProductoTerminadoComponent
			, componentProps: {
				datos: opcion
				, centroProduccion: this.centroProduccion
				, detalleActividad: true
			}
		};
		this.abrirlModal(datos);
	}

	async abrirlModal(datos) {
		const modal = await this.modalController.create({ ...datos, backdropDismiss: false });
		await modal.present();
		modal.onWillDismiss().then(({ data }) => {
			if (data.grupoElimino) {
				this.listarAnterior = true;
				setTimeout(() => {
					this.cerrarModal();
				}, 500);
			} else if (data) {
				this.listarAnterior = true;
				this.obtenerInformacion();
			}
		}, console.error);
	}

	agregarCantidad(option) {
		if (!this.searching) {
			this.searching = true;
			let data = {
				OrdeProdOperacionId: option['OrdeProdOperacionId'],
				GrupoId: null,
				Cantidad: 1,
				Tipo: (option['ListaChequeoId'] ? 'REPROCESO' : 'OPERACION'),
				centroProd: this.centroProduccion,
				contadorGrupo: (option['Contador'] == 0 ? 0 : 1),
				grupoId: this.idGrupo,
				actProd: this.datos['ActividadProduccionId'],
				detalleGrupo: true
			}
			this.actividadesService.informacion(data, 'CentrosProduccion/agregarLogActividad').then(({ msg, valido, detalleGrupo }) => {
				this.searching = false;
				if (!valido) {
					this.notificacionesService.notificacion(msg);
				} else {
					this.listarAnterior = true;
					this.detalleActividad = detalleGrupo;
					let enc = this.detalleActividad.find(it => +it['CantiRecib'] != +it['CantidadTotal']);
					if (!enc) {
						this.cerrarModal({ GrupoERP: true });
					} else {
						this.buscarFiltro({ value: this.valueBuscador });
					}
				}
			}).catch((error) => {
				console.log(error);
				this.searching = false;
			});
		}
	}

	buscarFiltro(evento) {
		this.valueBuscador = evento.value.toLowerCase();
		this.detalleActividad.forEach(op => {
			op['visible'] = false;
			if (
				op['NombreProd'].toLowerCase().includes(this.valueBuscador) ||
				op['Nombre'].toLowerCase().includes(this.valueBuscador) ||
				(op['NumerOrden'] + '').toLowerCase().includes(this.valueBuscador) ||
				op['Referencia'].toLowerCase().includes(this.valueBuscador)
			) {
				op['visible'] = true;
			}
		});
	}

}
