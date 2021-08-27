import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonInput, ModalController } from '@ionic/angular';
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
	@ViewChild('inputBuscar') inputBuscar: IonInput;
	@Input() idGrupo;
	@Input() centroProduccion;
	@Input() nombreCp;
	searching: boolean = true;
	infoActividades: Array<object> = [];
	cantidadAgregada: number = 0;
	posicionAnterior: number = -1;
	maquinariaActual: number = null;
	inicio: number = 1;
	fin: number = 15;
	inicioMaquinaria: number = 1;
	finMaquinaria: number = 15;
	cantidad: number = 15;
	valorBuscar: String = '';
	seleccionMultiple: boolean = false;
	datosMultiple: object = null;
	actividadesSeleccionadas: Array<object> = [];
	cantMultiple: number = 0;
	codeBase64 = 'data:image/jpeg;base64,';
	segmento: number = 0;
	verRecargar: boolean = true;
	collapseAbierto: boolean = false;
	collapseMultiple: boolean = false;

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private cargador: CargadorService,
		private notificcacionesService: NotificacionesService
	) { }

	ngOnInit() {
		this.obtenerActividades();
	}

	opcionCollapse(x, id?) {
		let data = document.getElementsByClassName('collapse show');
		data.length > 0 ? data[0].classList.remove("show") : null;
		if (this.posicionAnterior != -1) {
			if (this.posicionAnterior != x) {
				this.infoActividades[x]['collapse'] = !this.infoActividades[x]['collapse'];
				this.infoActividades[this.posicionAnterior]['collapse'] = false;
			} else if (this.infoActividades[this.posicionAnterior]['collapse'] || this.posicionAnterior == x) {
				this.infoActividades[this.posicionAnterior]['collapse'] = !this.infoActividades[this.posicionAnterior]['collapse'];
			}
		} else {
			this.infoActividades[x]['collapse'] = !this.infoActividades[x]['collapse'];
		}
		if (!this.infoActividades[x]['collapse']) {
			this.inicioMaquinaria = 1;
			this.finMaquinaria = this.cantidad;
			this.verRecargar = true;
		} else {
			this.verRecargar = false;
		}
		if (id != null) {
			this.collapseAbierto = this.infoActividades[x]['collapse'];
		}

		if (this.posicionAnterior == x) {
			this.maquinariaActual = null;
			this.posicionAnterior = -1;
		} else {
			this.maquinariaActual = id;
			this.posicionAnterior = x;
		}

		/* if (this.segmento == 1) {
			setTimeout(() => {
				let alto = +document.getElementById("listado" + x).getElementsByTagName('ion-list').item(0).offsetHeight;
				document.getElementById("collapse" + x).setAttribute('style', `height: ${alto}px !important`);
			}, 100);
		} */
	}

	cerrarModal(listar?) {
		this.modalController.dismiss(listar);
	}

	checkMultiples(evento) {
		if (!evento.detail.checked) {
			this.notificcacionesService.notificacion("Selección multiple desactivada.");
			this.datosMultiple = null;
		} else {
			this.cantMultiple++;
			this.notificcacionesService.notificacion("Selección multiple activada.");
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
		let index = -1;
		if (this.segmento == 0) {
			index = this.actividadesSeleccionadas.findIndex(op => op['OrdeProdId'] == dataOrde['OrdeProdId']);
		} else {
			index = this.actividadesSeleccionadas.findIndex(op => op['MaquinariaId'] == dataOrde['MaquinariaId']);
		}
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
		this.valorBuscar = evento.value;
		if (this.segmento == 0 || this.posicionAnterior == -1 || !this.collapseAbierto) {
			this.infoActividades = [];
			this.inicio = 1;
			this.fin = this.cantidad;
		} else {
			this.infoActividades[this.posicionAnterior]['actividades'] = []
		}
		this.refrescar(true);
	}

	refrescar(event?, total?) {
		if (this.segmento == 0) {
			this.posicionAnterior = -1;
			this.maquinariaActual = null;
		}
		if (this.segmento == 1) {
			this.inicioMaquinaria = 1;
			this.finMaquinaria = this.cantidad;
		}
		if (total) {
			this.inicio = 1;
			this.fin = this.cantidad;
			this.maquinariaActual = null;
			this.posicionAnterior = -1;
			this.infoActividades = [];
		}
		this.infiniteScroll.disabled = false;
		this.cantidadAgregada = 0;
		this.searching = true;
		this.obtenerActividades(event);
	}

	obtenerActividades(evento?, maquinaria?) {
		let datos = {
			inicio: this.inicio,
			fin: this.fin,
			centroProd: this.centroProduccion,
			buscar: this.valorBuscar,
			GrupoId: this.idGrupo ? this.idGrupo : null,
			segmento: this.segmento,
			iniciomaqInter: this.inicioMaquinaria,
			finmaqInter: this.finMaquinaria,
			maqInter: this.maquinariaActual
		}
		this.actividadesService.informacion(datos, 'CentrosProduccion/obtenerOrdenProduccion').then(resp => {
			if (!evento) {
				this.infoActividades = [];
			}
			if (this.maquinariaActual && this.infoActividades[this.posicionAnterior]['collapse']) {
				this.infoActividades[this.posicionAnterior]['actividades'] = this.infoActividades[this.posicionAnterior]['actividades'].concat(resp);

				if (evento && evento.target) {
					evento.target.complete();
				}
				/* && this.finMaquinaria >= +this.infoActividades[this.infoActividades.length - 1]['totCol'] */
				if (!resp.length) {
					if (evento && evento.target) {
						evento.target.disabled = true;
					}
				}
			} else {
				this.infoActividades = this.infoActividades.concat(resp);
				if (resp.length && this.fin >= +this.infoActividades[this.infoActividades.length - 1]['totCol']) {
					if (evento && evento.target) {
						evento.target.disabled = true;
					}
				}
				if (evento && evento.target) {
					evento.target.complete();
				}
			}
			this.searching = false;
		}, (error) => {
			if (evento && evento.target) {
				evento.target.complete();
			}
			this.searching = false;
			console.error(error);
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

	cambioSegmento(event) {
		this.inputBuscar.value = '';
		this.segmento = event.detail.value;
		this.collapseAbierto = false;
		this.inicio = 1;
		this.fin = this.cantidad;
		this.actividadesSeleccionadas = [];
		this.verRecargar = true;
		this.refrescar(null, true);
	}

	loadDataMaquinaria(evento) {
		this.inicioMaquinaria += this.cantidad;
		this.finMaquinaria += this.cantidad;
		this.obtenerActividades(evento);
	}

}
