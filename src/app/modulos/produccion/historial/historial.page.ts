import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { HistorialService } from '../../../servicios/historial.service';
import { FiltrosHistorialComponent } from './filtros-historial/filtros-historial.component';

@Component({
	selector: 'app-historial',
	templateUrl: './historial.page.html',
	styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
	dataHistorial: Array<object> = [];
	searching: boolean = true;
	fechaInicio: string = '';
	fechaFin: string = '';
	posicionAnterior: number = -1;
	inicio: number = 1;
	fin: number = 15;
	cantidad: number = 15;

	constructor(
		private historialService: HistorialService,
		private modalController: ModalController,
	) { }

	ngOnInit() { }

	ionViewDidEnter() {
		this.obtenerHistorial(null, true);
	}

	refrescar(event?) {
		this.inicio = 1;
		this.fin = this.cantidad;
		this.infiniteScroll.disabled = false;
		this.searching = true;
		this.posicionAnterior = -1;
		this.obtenerHistorial(event, true);
	}

	obtenerHistorial(event?, refresh?) {
		this.searching = !event ? true : false;
		if (refresh) {
			this.dataHistorial = [];
			this.inicio = 1;
			this.fin = 15;
		}
		let data = {
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			inicio: this.inicio,
			fin: this.fin
		}
		this.historialService.informacion(data, 'CentrosProduccion/obtenerHistorial').then(({ datos, final }) => {
			this.dataHistorial = this.dataHistorial.concat(datos);
			if (!final) {
				if (event) {
					event.target.disabled = true;
				} else {
					this.infiniteScroll.disabled = true;
				};
			}
			if (event) {
				event.target.complete();
				this.posicionAnterior = -1;
			}
			this.searching = false;
		}, error => {
			console.error("Error ", error);
			if (event) {
				event.target.complete();
			}
			this.searching = false;
		}).catch((error) => {
			console.error("Error ", error);
			if (event) {
				event.target.complete();
			}
			this.searching = false;
		});
	}

	async filtros() {
		let componentProps = { fechaInicio: this.fechaInicio, fechaFin: this.fechaFin };
		const modal = await this.modalController.create({
			component: FiltrosHistorialComponent,
			backdropDismiss: true,
			cssClass: 'animate__animated animate__slideInRight animate__faster',
			componentProps
		});

		await modal.present();
		modal.onWillDismiss().then(({ data }) => {
			if (data) {
				if (data.limpiar) {
					this.fechaInicio = '';
					this.fechaFin = '';
					this.refrescar();
				} else {
					this.fechaInicio = data.desde;
					this.fechaFin = data.hasta;
					this.searching = true;
					this.infiniteScroll.disabled = false;
					this.obtenerHistorial(undefined, true);
				}
			}
		}).catch((error) => {
			console.log(error);
		});
	}

	opcionCollapse(x) {
		let data = document.getElementsByClassName('collapse show');
		data.length > 0 ? data[0].classList.remove("show") : null;
		if (this.posicionAnterior != -1) {
			if (this.posicionAnterior != x) {
				this.dataHistorial[x]['collapse'] = !this.dataHistorial[x]['collapse'];
				this.dataHistorial[this.posicionAnterior]['collapse'] = false;
			} else if (this.dataHistorial[this.posicionAnterior]['collapse'] || this.posicionAnterior == x) {
				this.dataHistorial[this.posicionAnterior]['collapse'] = !this.dataHistorial[this.posicionAnterior]['collapse'];
			}
		} else {
			this.dataHistorial[x]['collapse'] = !this.dataHistorial[x]['collapse'];
		}
		this.posicionAnterior = x;
	}

	loadData(event) {
		this.inicio += this.cantidad;
		this.fin += this.cantidad;
		this.obtenerHistorial(event);
	}

}
