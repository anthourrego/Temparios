import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from '../config/funciones/funciones';
import { CargadorService } from '../servicios/cargador.service';
import { LoginService } from '../servicios/login.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { StorageService } from '../servicios/storage.service';
import { ThemeService } from '../servicios/theme.service';
import { ModalController } from '@ionic/angular';
import { ModalconfiguracionComponent } from './componentes/modalconfiguracion/modalconfiguracion.component';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

	formLogin: { formulario: RxFormGroup, propiedades: Array<string> };
	ingresoDocumento: Boolean = true;
	claseDocumento: string = '';
	claseUsuario: string = '';
	verPassword: Boolean = false;
	versionNumber: string = '';

	constructor(
		private router: Router,
		private notificaciones: NotificacionesService,
		private loginService: LoginService,
		private storageService: StorageService,
		private cargadorService: CargadorService,
		private theme: ThemeService,
		private appVersion: AppVersion,
		private modalController: ModalController,
	) {
		this.appVersion.getVersionNumber().then(op => {
			this.versionNumber = op;
		});
	}

	ngOnInit() {
		this.configForm();
	}

	ionViewWillEnter() {
		this.validarAccion();
	}

	async validarAccion() {
		this.formLogin.formulario.markAsUntouched();
		let datos = {
			nroDocumento: await this.storageService.get('nroDocumento'),
			password: await this.storageService.get('password'),
			nit: await this.storageService.get('nit')
		}
		if (datos.nroDocumento && datos.password && datos.nit) {
			datos.password = await this.loginService.desencriptar(JSON.parse(datos.password));
			this.formLogin.formulario.patchModelValue(datos);
			this.login();
		}
	}

	configForm() {
		this.formLogin = FuncionesGenerales.crearFormulario(this.loginService);
	}

	get fontSize() {
		return { 'fontSize': this.theme.getStyle() };
	};

	login() {
		if (this.formLogin.formulario.valid) {
			this.cargadorService.presentar().then(resp => {
				const data = Object.assign({}, this.formLogin.formulario.value);
				this.loginService.iniciarSesionUser(data, this.versionNumber).then(async ({ mensaje, db, usuario, valido, indice, centrosProduccion, crypt, password }) => {
					if (valido) {
						this.storageService.set('conexion', JSON.stringify(db));
						this.storageService.set('nroDocumento', data.nroDocumento);
						this.storageService.set('usuario', JSON.stringify(usuario));
						await this.storageService.set('crypt', crypt);
						this.storageService.set('password', JSON.stringify(password));
						this.storageService.set('indice', indice);
						let centrosProduccionDecryp = await this.loginService.desencriptar(centrosProduccion);
						if (centrosProduccionDecryp.length == 1) {
							let encryp = await this.loginService.encriptar({
								CentroProduccion: centrosProduccionDecryp[0].CentroProduccionId,
								cantidad: centrosProduccionDecryp.length
							});
							this.storageService.set('centroProduccion', encryp);
							this.router.navigateByUrl('/modulos/produccion/actividades');
						} else {
							this.storageService.set('centrosProduccion', JSON.stringify(centrosProduccion));
							this.router.navigateByUrl('/modulos/centros-produccion');
						}
						this.formLogin.formulario.reset();
						this.formLogin.formulario.markAsUntouched();
					} else {
						this.notificaciones.notificacion(mensaje);
					}
					this.cargadorService.ocultar();
				}, error => {
					this.notificaciones.notificacion('Error de conexión');
					console.error("Error ", error);
					this.cargadorService.ocultar();
				}).catch((error) => {
					console.error("Error ", error);
					this.cargadorService.ocultar();
				});
			});
		} else {
			FuncionesGenerales.formularioTocado(this.formLogin.formulario);
		}
	}

	async configuracion() {
		const modal = await this.modalController.create({
			component: ModalconfiguracionComponent
		});

		await modal.present();

		modal.onDidDismiss().then(({ data, role }) => {
			// Se puede agregar funcionalidad si lo requiere
		})
	}

}
