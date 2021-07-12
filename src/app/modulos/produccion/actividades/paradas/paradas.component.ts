import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TipoParadasService } from 'src/app/servicios/tipo-paradas.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';
import { CargadorService } from '../../../../servicios/cargador.service';
import { countUpTimerConfigModel, timerTexts, CountupTimerService, CountdownTimerService } from 'ngx-timer';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-paradas',
	templateUrl: './paradas.component.html',
	styleUrls: ['./paradas.component.scss'],
})
export class ParadasComponent implements OnInit {

	paradas: Array<object> = [];
	buscando: boolean = true;
	cuentaRegresiva: boolean = false;
	tiempoCuentaRegresiva: object = {};
	idParada: number = -1;
	testConfig;
	subject = new Subject();

	constructor(
		private modalController: ModalController,
		private tipoParadasService: TipoParadasService,
		private notificacionesService: NotificacionesService,
		private cargadorService: CargadorService,
		private countupTimerService: CountupTimerService,
		private countdownTimerService: CountdownTimerService
	) { }

	ngOnInit() {
		this.obtenerActividades();
		this.configTime();
	}

	cerrarModal(listar?) {
		if (this.cuentaRegresiva) {
			if (!this.tiempoCuentaRegresiva['up']) {
				this.countdownTimerService.onTimerStatusChange.emit("STOP");
			} else {
				this.agregarLog();
			}
		} else {
			this.modalController.dismiss(listar);
		}
	}

	obtenerActividades(evento?) {
		this.buscando = true;
		this.tipoParadasService.informacion({}, 'CentrosProduccion/obtenerTiposParadas').then(({ valido, datos }) => {
			if (valido && datos.length) {
				this.paradas = datos;
			} else {
				this.paradas = [];
				this.notificacionesService.notificacion("No se encontro información");
			}
			if (evento) {
				evento.target.complete();
			}
			this.buscando = false;
		}, (error) => {
			this.buscando = false;
			console.log(error);
		});
	}

	contarCuentaRegresiva(opcion) {
		this.tiempoCuentaRegresiva = Object.assign({}, opcion);
		if (!opcion['TiempoMaximo'] || opcion['TiempoMaximo'] <= 0) {
			this.tiempoCuentaRegresiva = { ...this.tiempoCuentaRegresiva, up: true };
			this.countupTimerService.startTimer();
		} else {
			this.tiempoCuentaRegresiva = { ...this.tiempoCuentaRegresiva, down: true };
			let fecha = moment().add(opcion['TiempoMaximo'], 'minute').toDate();
			this.countdownTimerService.startTimer(fecha);
			this.suscripcionTiempo();
		}
		this.ejecutarPeticionLog('STOPINICIO');
		this.cuentaRegresiva = true;
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
					this.cerrarModal(true);
					this.idParada = -1;
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

	agregarLog() {
		if (this.tiempoCuentaRegresiva['up']) {
			this.countupTimerService.stopTimer()
			this.cargadorService.presentar("Guardando información").then(() => {
				this.ejecutarPeticionLog('STOPFIN');
			});
		} else {
			this.countdownTimerService.onTimerStatusChange.emit("STOP");
		}
	}

	configTime() {
		this.testConfig = new countUpTimerConfigModel();
		this.testConfig.timerClass = 'test_Timer_class';
		this.testConfig.timerTexts = new timerTexts();
		this.testConfig.timerTexts.hourText = ":";
		this.testConfig.timerTexts.minuteText = ":";
		this.testConfig.timerTexts.secondsText = ":";
	}

	suscripcionTiempo() {
		this.countdownTimerService.onTimerStatusChange.pipe(takeUntil(this.subject)).subscribe(status => {
			if (status == "STOP") this.subject.next(true);
		}, (err) => { }, () => {
			this.cargadorService.presentar("Guardando información").then(() => {
				this.ejecutarPeticionLog('STOPFIN');
			});
		});
	}

}
