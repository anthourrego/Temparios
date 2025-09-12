import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { DateUtilsService } from 'src/app/servicios/date-utils.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
@Component({
	selector: 'app-filtros-historial',
	templateUrl: './filtros-historial.component.html',
	styleUrls: ['./filtros-historial.component.scss'],
})
export class FiltrosHistorialComponent implements OnInit {

	@Input() fechaInicio: string;
	@Input() fechaFin: string;
	formFiltro: UntypedFormGroup;
	maximoFechaDesde: string;
	minFechaHasta: string;
	maximoFechaHasta: string;

	constructor(
		private modalController: ModalController,
		private notificaciones: NotificacionesService,
		private dateUtilsService: DateUtilsService
	) { }

	ngOnInit() {
		// Inicializar fechas con date-fns
		this.maximoFechaDesde = this.dateUtilsService.getCurrentDate();
		this.minFechaHasta = this.dateUtilsService.getMinDate();
		this.maximoFechaHasta = this.dateUtilsService.getCurrentDate();

		this.formFiltro = new UntypedFormGroup({
			desde: new UntypedFormControl(this.fechaInicio),
			hasta: new UntypedFormControl(this.fechaFin),
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
				informacion['hasta'] = this.dateUtilsService.formatToISODate(informacion['hasta']);
				informacion['desde'] = this.dateUtilsService.formatToISODate(informacion['desde']);
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
