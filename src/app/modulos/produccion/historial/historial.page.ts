import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { HistorialService } from '../../../servicios/historial.service';

@Component({
	selector: 'app-historial',
	templateUrl: './historial.page.html',
	styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

	dataHistorial: Array<object> = [];
	searching: boolean = true;

	constructor(
		private historialService: HistorialService
	) { }

	ngOnInit() { }

	ionViewDidEnter() {
		this.dataHistorial = [];
		this.obtenerHistorial();
	}

	obtenerHistorial(event?) {
		this.searching = !event ? true : false;
		this.historialService.informacion({}, 'CentrosProduccion/obtenerHistorial').then(({ datos, valido }) => {
			this.dataHistorial = datos.map(op => {
				op.Hora = moment(op.Fecha).format('HH:mm:ss');
				op.FechaReg = moment(op.Fecha).format('DD/MM/YYYY');
				return op;
			});
			if (event) {
				event.target.complete();
			}
			this.searching = false;
		}, error => {
			console.error("Error ", error);
			if (event) {
				event.target.complete();
			}
			this.searching = false;
		});
	}

}
