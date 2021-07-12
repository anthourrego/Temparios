import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { ActividadesService } from 'src/app/servicios/actividades.service';
import { CargadorService } from '../../../../servicios/cargador.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';

@Component({
	selector: 'app-agregar-actividades',
	templateUrl: './agregar-actividades.component.html',
	styleUrls: ['./agregar-actividades.component.scss'],
})
export class AgregarActividadesComponent implements OnInit {

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
	@Input() idGrupo;
	@Input() centroProduccion;
	searching: boolean = true;
	infoActividades: Array<object> = [];
	cantidadAgregada: number = 0;
	posicionAnterior: number = -1;
	inicio: number = 1;
	fin: number = 15;
	cantidad: number = 15;
	valorBuscar: String = '';
	seleccionMultiple: boolean = false;
	datosMultiple: object = null;
	actividadesSeleccionadas: Array<object> = [];
	cantMultiple: number = 0;
	codeBase64 = 'data:image/jpeg;base64,';

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private cargador: CargadorService,
		private notificcacionesService: NotificacionesService
	) { }

	ngOnInit() {
		this.obtenerActividades();
	}

	opcionCollapse(x) {
		let data = document.getElementsByClassName('collapse show');
		data.length > 0 ? data[0].classList.remove("show") : null;
		this.infoActividades[x]['collapse'] = !this.infoActividades[x]['collapse'];
		if (this.posicionAnterior != -1) {
			this.infoActividades[this.posicionAnterior]['collapse'] = false;
		}
		this.posicionAnterior = x;
	}

	cerrarModal(listar?) {
		this.modalController.dismiss(listar);
	}

	checkMultiples(evento) {
		if (!evento.detail.checked) {
			this.datosMultiple = null;
		} else {
			this.cantMultiple++;
		}
	}

	opcionCheck(evento, pos1, pos2, element) {
		if (this.seleccionMultiple) {
			if (this.datosMultiple) {
				if (this.datosMultiple['ActividadProduccionId'] !== this.infoActividades[pos1]['actividades'][pos2]['ActividadProduccionId']) {
					this.notificcacionesService.notificacion("No es un producto valido para multiple.");
					let ele = document.getElementById(element);
					ele['checked'] = false;
					return;
				}
			} else {
				this.datosMultiple = this.infoActividades[pos1]['actividades'][pos2];
			}
		}
		this.infoActividades[pos1]['actividades'][pos2]['checked'] = evento.detail.checked;
		let dataOrde = this.infoActividades[pos1];
		let dataActi = this.infoActividades[pos1]['actividades'][pos2];
		let index = this.actividadesSeleccionadas.findIndex(op => op['OrdeProdId'] == dataOrde['OrdeProdId']);
		if (evento.detail.checked) {
			let info = { ...dataActi, multiple: this.seleccionMultiple, tipoMultiple: 'Multiple' + this.cantMultiple };
			dataOrde['actividades'][pos2] = info;
			if (index != -1) {
				this.actividadesSeleccionadas[index] = dataOrde;
			} else {
				this.actividadesSeleccionadas.push(dataOrde);
			}
		} else {
			if (index != -1) {
				let cant = this.actividadesSeleccionadas[index]['actividades'].filter(op => op.checked).length;
				if (cant <= 0) {
					this.actividadesSeleccionadas.splice(index, 1);
				}
			}
		}
	}

	buscarFiltro(evento) {
		this.valorBuscar = evento.detail.value;
		this.refrescar();
	}

	refrescar(event?) {
		this.inicio = 1;
		this.fin = this.cantidad;
		this.infoActividades = [];
		this.infiniteScroll.disabled = false;
		this.cantidadAgregada = 0;
		this.searching = true;
		this.posicionAnterior = -1;
		this.obtenerActividades(event);
	}

	obtenerActividades(evento?) {
		let datos = {
			inicio: this.inicio,
			fin: this.fin,
			centroProd: this.centroProduccion,
			buscar: this.valorBuscar,
			GrupoId: this.idGrupo ? this.idGrupo : null
		}
		this.actividadesService.informacion(datos, 'CentrosProduccion/obtenerOrdenProduccion').then(resp => {
			if (!evento) {
				this.infoActividades = [];
			}
			this.infoActividades = this.infoActividades.concat(resp);
			if (resp.length && this.fin >= +this.infoActividades[this.infoActividades.length - 1]['totCol']) {
				if (evento) {
					evento.target.disabled = true;
				}
			}
			if (evento) {
				evento.target.complete();
			}
			this.searching = false;
		}, (error) => {
			if (evento) {
				evento.target.complete();
			}
			this.searching = false;
			console.error
		});
	}

	agregarActividades() {
		this.cargador.presentar("Agregando actividades").then(async (resp) => {
			let datos = this.organizarDataGuardar();
			this.actividadesService.informacion(datos, 'CentrosProduccion/agregarActividadOperario').then(({ valido, msg }) => {
				this.cargador.ocultar();
				if (valido) {
					this.cerrarModal(true);
				} else {
					this.notificcacionesService.notificacion(msg);
				}
			}, error => {
				console.error(error);
				this.cargador.ocultar();
			});
		});
	}

	loadData(event) {
		this.inicio += this.cantidad;
		this.fin += this.cantidad;
		this.obtenerActividades(event);
	}

	organizarDataGuardar() {
		let multiples = {}, individuales = [];
		this.actividadesSeleccionadas.forEach(x => {
			x['actividades'].forEach(op => {
				let data = { OrdeProdOperacionId: op['OrdeProdOperacionId'] };
				if (op['multiple']) {
					if (!multiples[op['tipoMultiple']]) {
						multiples[op['tipoMultiple']] = [];
					}
					multiples[op['tipoMultiple']].push(data);
				} else if (op['checked']) {
					individuales.push(data);
				}
			});
		});
		return { multiples, individuales, grupo: this.idGrupo ? this.idGrupo : null };
	}

}
