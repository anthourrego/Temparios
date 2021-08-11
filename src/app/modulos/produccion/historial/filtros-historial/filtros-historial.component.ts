import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
@Component({
	selector: 'app-filtros-historial',
	templateUrl: './filtros-historial.component.html',
	styleUrls: ['./filtros-historial.component.scss'],
})
export class FiltrosHistorialComponent implements OnInit {

	@Input() fechaInicio: string;
	@Input() fechaFin: string;
	formFiltro: FormGroup;
	maximoFechaDesde = moment().format('YYYY-MM-DD');
	minFechaHasta = moment("0000-01-01", "YYYY-MM-DD").format('YYYY-MM-DD');
	maximoFechaHasta = moment().format('YYYY-MM-DD');

	constructor(
		private modalController: ModalController,
		private notificaciones: NotificacionesService,
	) { }

	ngOnInit() {
		this.formFiltro = new FormGroup({
			desde: new FormControl(this.fechaInicio),
			hasta: new FormControl(this.fechaFin),
		});
	}

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

	cambioFechaDesde($event) {
		this.minFechaHasta = $event;
	}

	cambioFechaHasta($event) {
		this.maximoFechaDesde = $event;
	}

	filtrar() {
		let filtra = true;
		const informacion = Object.assign({}, this.formFiltro.value);
		if (informacion['desde'] != "" || informacion['hasta'] != "") {
			if (informacion['desde'] && informacion['hasta']) {
				informacion['hasta'] = moment(informacion['hasta']).format('YYYY-MM-DD');
				informacion['desde'] = moment(informacion['desde']).format('YYYY-MM-DD');
			} else {
				if (informacion['hasta'] || informacion['desde']) {
					filtra = false
				}
			}
			if (informacion['desde'] <= informacion['hasta'] && filtra) {
				this.cerrarModal(informacion);
			} else {
				this.notificaciones.notificacion("Ingrese un rango de fechas valido.");
			}
		} else {
			this.notificaciones.notificacion("Ingrese algún filtro.");
		}
	}

	limpiarFormulario() {
		this.formFiltro.reset();
		this.cerrarModal({ limpiar: true });
	}

}
