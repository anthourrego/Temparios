import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TipoParadasService } from 'src/app/servicios/tipo-paradas.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';
import { CargadorService } from '../../../../servicios/cargador.service';

@Component({
	selector: 'app-paradas',
	templateUrl: './paradas.component.html',
	styleUrls: ['./paradas.component.scss'],
})
export class ParadasComponent implements OnInit {

	@ViewChild('countdown') tiempo: any;
	paradas: Array<object> = [];
	buscando: boolean = true;
	cuentaRegresiva: boolean = false;
	tiempoCuentaRegresiva: object = {};
	idParada: number = -1;

	constructor(
		private modalController: ModalController,
		private tipoParadasService: TipoParadasService,
		private notificacionesService: NotificacionesService,
		private cargadorService: CargadorService
	) { }

	ngOnInit() {
		this.obtenerActividades();
	}

	cerrarModal(listar?) {
		if (this.cuentaRegresiva) {
			this.agregarLog({ action: 'done' });
		} else {
			this.modalController.dismiss(listar);
		}
	}

	obtenerActividades(evento?) {
		this.buscando = true;
		this.tipoParadasService.informacion({}, 'CentrosProduccion/obtenerTiposParadas').then(({ valido, datos }) => {
			if (valido && datos.length) {
				this.paradas = datos.map(it => {
					it['TiempoMaximo'] *= 60;
					return it;
				});
			} else {
				this.notificacionesService.notificacion("No se encontro información");
			}
			if (evento) {
				evento.target.complete();
			}
			this.buscando = false;
		}, console.error);
	}

	contarCuentaRegresiva(opcion) {
		this.tiempoCuentaRegresiva = opcion;
		this.cuentaRegresiva = true;
		this.ejecutarPeticionLog('STOPINICIO');
	}

	ejecutarPeticionLog(Tipo) {
		let data = {
			Tipo,
			TipoParada: this.tiempoCuentaRegresiva['TipoParadaId'],
			idParada: this.idParada
		}
		this.tipoParadasService.informacion(data, 'CentrosProduccion/agregarLogParada').then(({ valido, msg, idParada }) => {
			if (valido) {
				if (Tipo == 'STOPFIN') {
					this.cargadorService.ocultar();
					this.cuentaRegresiva = false;
					this.idParada = -1;
					this.cerrarModal(true);
				} else {
					this.idParada = idParada;
				}
			} if (!valido) {
				if (data.Tipo == 'STOPINICIO') {
					this.idParada = -1;
					this.cuentaRegresiva = false;
				}
				this.notificacionesService.notificacion(msg);
			}
		}, (error) => {
			console.error(error);
			this.cuentaRegresiva = false;
			if (Tipo == 'STOPFIN') {
				this.cargadorService.ocultar();
			}
		});
	}

	agregarLog({ action }) {
		if (action == "done") {
			this.tiempo.stop();
			this.cargadorService.presentar("Guardando información").then(() => {
				this.ejecutarPeticionLog('STOPFIN');
			});
		}
	}

}
