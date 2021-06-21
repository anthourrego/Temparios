import { Component, OnInit, ViewChild } from '@angular/core';
import { IonCheckbox, IonRange } from '@ionic/angular';
import { Constantes } from 'src/app/config/constantes/constantes';
import { CargadorService } from 'src/app/servicios/cargador.service';
import { LoginService } from 'src/app/servicios/login.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { ThemeService } from 'src/app/servicios/theme.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-configuracion',
	templateUrl: './configuracion.page.html',
	styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {

	temas = Constantes.valoresTemas;
	@ViewChild('rangeLetra') range: IonRange;
	@ViewChild('checkLetra') check: IonCheckbox;

	constructor(
		public theme: ThemeService,
		private notificaciones: NotificacionesService,
		private storage: StorageService,
		private router: Router,
		private cargadorService: CargadorService,
		private loginService: LoginService
	) { }

	ngOnInit() { }

	valorFuente(evento) {
		const size = evento?.detail?.value;
		if (size) {
			this.theme.setFontSize(size);
		}
	}

	setTema(event) {
		const tema = event?.detail?.value;
		this.theme.setTheme(tema);
	}

	ngAfterViewInit(): void {
		if (this.range) {
			this.storage.get('fontSize').then((size) => {
				this.range.value = size;
				this.storage.get('appliedSize').then((applied) => {
					this.range.disabled = !applied;
					this.check.checked = applied;
				});
			});
		}
	}

	get fontSize() {
		return { 'fontSize': this.theme.getStyle() }
	}

	restaurarLetra(event) {
		const opciones = [
			{
				text: 'Si',
				handler: () => {
					this.theme.setFontSize(0, true);
					this.range.disabled = true;
				}
			}, {
				text: 'No',
				role: 'cancel',
				handler: () => {
					this.check.checked = true;
				}
			}
		];
		if (!event?.detail.checked) {
			this.notificaciones.alerta('Restaurar tamaño de letra?', opciones);
		} else {
			this.range.disabled = false;
			this.theme.appliedSize = true;
			this.theme.setFontSize(this.range.value as number);
		}
	}

	confirmarCerrarSesion(terminar?) {
		this.notificaciones.alerta('', undefined, undefined, `¿Esta seguro de ${terminar ? 'terminar turno' : 'cerrar sesión'}?`).then(async respuesta => {
			if (respuesta.role === 'aceptar') {
				this.cargadorService.presentar().then(resp => {
					this.ejecutarPeticionLog(terminar);
				}).catch(error => {
					this.cargadorService.ocultar();
				});
			}
		}, console.error);
	}

	ejecutarPeticionLog(terminar) {
		let data = {
			Tipo: 'SALIDA', //INGRESO
			TipoParada: null
		}
		this.loginService.informacion(data, 'CentrosProduccion/agregarLogParada').then(({ valido, msg }) => {
			if (valido) {
				if (terminar) {
					this.storage.remove('centroProduccion');
					this.storage.remove('centrosProduccion');
					this.storage.remove('conexion');
					this.storage.remove('usuario');
					if (navigator['app']) {
						navigator['app'].exitApp();
					}
				} else {
					this.storage.limpiarTodo(true);
					this.cargadorService.ocultar();
				}
			} else {
				this.notificaciones.notificacion(`No fue posible ${terminar ? 'terminar el turno' : 'cerrar la sesión'}`);
			}
			this.cargadorService.ocultar();
		}, (error) => {
			console.error(error);
			this.cargadorService.ocultar();
		});
	}

}
