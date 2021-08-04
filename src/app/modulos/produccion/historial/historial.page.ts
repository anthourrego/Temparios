import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { HistorialService } from '../../../servicios/historial.service';
import { FiltrosHistorialComponent } from './filtros-historial/filtros-historial.component';

@Component({
	selector: 'app-historial',
	templateUrl: './historial.page.html',
	styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

	dataHistorial: Array<object> = [];
	searching: boolean = true;
	fechaInicio: string = '';
	fechaFin: string = '';
	posicionAnterior: number = -1;

	constructor(
		private historialService: HistorialService,
		private modalController: ModalController,
	) { }

	ngOnInit() { }

	ionViewDidEnter() {
		this.dataHistorial = [];
		this.obtenerHistorial();
	}

	obtenerHistorial(event?) {
		this.searching = !event ? true : false;
		let data = {
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin
		}
		this.historialService.informacion(data, 'CentrosProduccion/obtenerHistorial').then(({ datos, valido }) => {
			this.dataHistorial = datos.map(op => {
				op.Hora = moment(op.Fecha).format('HH:mm:ss');
				op.FechaReg = moment(op.Fecha).format('DD/MM/YYYY');
				if (op.GrupoId) {
					op.GrupoActividades.map(op2 => {
						op2.Hora = moment(op2.Fecha).format('HH:mm:ss');
						op2.FechaReg = moment(op2.Fecha).format('DD/MM/YYYY');
					});
				}
				return op;
			});
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

	async filtros(){
		let componentProps = {fechaInicio: this.fechaInicio, fechaFin: this.fechaFin};
		const modal = await this.modalController.create({
			component: FiltrosHistorialComponent,
			backdropDismiss: true,
			cssClass: 'animate__animated animate__slideInRight animate__faster',
			componentProps
		});

		await modal.present();
		modal.onWillDismiss().then(({ data }) => {
			this.fechaInicio = data.desde;
			this.fechaFin = data.hasta;
			this.searching = true;
			this.obtenerHistorial();
		}).catch((error) =>{
			console.log(error);
		});
	}

	opcionCollapse(x) {
		let data = document.getElementsByClassName('collapse show');
		data.length > 0 ? data[0].classList.remove("show") : null;
		this.dataHistorial[x]['collapse'] = !this.dataHistorial[x]['collapse'];
		if (this.posicionAnterior != -1) {
			this.dataHistorial[this.posicionAnterior]['collapse'] = false;
		}
		this.posicionAnterior = x;
	}

}
