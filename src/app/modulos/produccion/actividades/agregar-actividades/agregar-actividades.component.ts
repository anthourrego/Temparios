import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { ActividadesService } from 'src/app/servicios/actividades.service';
import { StorageService } from '../../../../servicios/storage.service';
import { CargadorService } from '../../../../servicios/cargador.service';

@Component({
	selector: 'app-agregar-actividades',
	templateUrl: './agregar-actividades.component.html',
	styleUrls: ['./agregar-actividades.component.scss'],
})
export class AgregarActividadesComponent implements OnInit {

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
	searching: boolean = true;
	infoActividades: Array<object> = [];
	centroProd: string;
	cantidadAgregada: number = 0;
	posicionAnterior: number = -1;
	inicio: number = 1;
	fin: number = 15;
	cantidad: number = 15;
	valorBuscar: String = '';
	actividadesActuales: Array<object> = [];

	constructor(
		private modalController: ModalController,
		private actividadesService: ActividadesService,
		private storage: StorageService,
		private cargador: CargadorService
	) { }

	ngOnInit() {
		this.obtenerInformacion();
	}

	async obtenerInformacion() {
		this.actividadesActuales = await this.storage.get('actividades');
		if (!this.actividadesActuales) {
			this.actividadesActuales = [];
		}
		let { CentroProduccion } = this.actividadesService.desencriptar(JSON.parse(await this.storage.get('centroProduccion')));
		this.centroProd = CentroProduccion;
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

	opcionCheck({ detail }, pos1, pos2) {
		this.infoActividades[pos1]['actividades'][pos2]['checked'] = detail.checked;
		this.infoActividades[pos1]['actividades'][pos2]['checked'] ? this.cantidadAgregada++ : this.cantidadAgregada--;
	}

	buscarFiltro({ detail }) {
		this.valorBuscar = detail.value;
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
		let datos: any = {
			inicio: this.inicio,
			fin: this.fin,
			centroProd: this.centroProd,
			buscar: this.valorBuscar
		}
		this.actividadesService.informacion(datos, 'CentrosProduccion/obtenerOrdenProduccion').then(resp => {
			if (!evento) {
				this.infoActividades = [];
			}
			this.actividadesActuales.forEach(it => {
				resp.forEach((x, index) => {
					let pos = x.actividades.findIndex(op => op.OrdeProdOperacionId == it);
					if (pos != -1) {
						resp[index].actividades[pos]['checked'] = true;
					}
				});
			});
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
		}, console.error);
	}

	agregarActividades() {
		this.cargador.presentar("Agregando actividades").then(async (resp) => {
			let actividades = [];
			this.infoActividades.forEach(x => {
				x['actividades'].forEach(op => {
					if (op['checked']) {
						actividades.push(op['OrdeProdOperacionId']);
					}
				});
			});
			/* this.actividadesService.informacion(actividades, 'agregarActividades').then(resp => {
				this.storage.set('actividades', actividades);
				this.cargador.ocultar();
				this.cerrarModal(true);
			}); */
			/* if (this.actividadesActuales.length) {
				actividades = actividades.concat(this.actividadesActuales);
			} */
			this.storage.set('actividades', actividades);
			this.cerrarModal(true);
			this.cargador.ocultar();
		});
	}

	loadData(event) {
		this.inicio += this.cantidad;
		this.fin += this.cantidad;
		this.obtenerActividades(event);
	}

}
