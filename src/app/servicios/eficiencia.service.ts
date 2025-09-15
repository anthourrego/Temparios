import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'Crypto-js';
import { DateUtilsService } from './date-utils.service';
import { FuncionesGenerales } from '../config/funciones/funciones';
import { NotificacionesService } from './notificaciones.service';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class EficienciaService {

	private headers: HttpHeaders;
	private url = `${environment.urlBack}API/CentrosProduccion/Eficiencia`;
	private nit = '';
	private eficiencia = new Subject();
	private eficienciaModo = new Subject();
	eficiencia$ = this.eficiencia.asObservable();
	eficienciaModo$ = this.eficienciaModo.asObservable();

	constructor(
		private 	httpClient				: HttpClient,
		private 	storageService			: StorageService,
		protected	notificacionesService	: NotificacionesService,
		private dateUtilsService: DateUtilsService,
		private peticionService: PeticionService
	) {
		this.obtenerNit();
		this.obtenerUrl();
		this.obtenerHeaders().then( () => {
			this.obtenerEficiencia();
		});
	}

	async obtenerNit() {
		this.nit = await this.storageService.get('nit')
	}

	async obtenerUrl() {
		let esContingencia = await this.storageService.get('usarUrlContingencia');

		if (environment.production) {
			if (esContingencia) {
				this.url = environment.urlContingencia;
			} else {
				this.url = environment.urlBack;
			}
		} else {
			if (esContingencia) {
				this.url = await this.storageService.get('urlSecundariaTesting');
			} else {
				this.url = environment.urlBack
			};
		}
	}

	async obtenerHeaders() {
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		const Cedula = await this.storageService.get('nroDocumento').then(resp => resp);
		const indice = await this.storageService.get('indice').then(resp => resp);
		const Version = await this.storageService.get('version').then(resp => resp);
		let user = await this.peticionService.desencriptar(JSON.parse(await this.storageService.get('usuario').then(resp => resp)));
		let turno = JSON.parse(await this.storageService.get('usuario').then(resp => resp));
		this.headers = new HttpHeaders({
			Token: '' + user.OperarioId
			, Conexion
			, Cedula
			, Nit: this.nit
			, Usuario: '' + user.OperarioId
			, indice
			, Version: (Version || '')
			, NomUsuario: user.nombre
			, TurnoId: (turno.TurnoId || '')
		});
		this.peticion();
	}


	async encriptar(datos) {
		const salt = CryptoJS.lib.WordArray.random(256);
		const iv = CryptoJS.lib.WordArray.random(16);
		const crypt = JSON.parse(await this.storageService.get('crypt').then(resp => resp));
		const key = CryptoJS.PBKDF2(crypt.key, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: crypt.it });
		const encrypted = CryptoJS.AES.encrypt(JSON.stringify(datos), key, { iv: iv });
		const data = {
			ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
			salt: CryptoJS.enc.Hex.stringify(salt),
			iv: CryptoJS.enc.Hex.stringify(iv)
		}
		return JSON.stringify(data);
	}

	obtenerEficiencia() { //900000 = 15 min
		setInterval(() => {
			this.peticion();
		}, 900000)
	}

	async peticion() {
		if (this.nit === null) {
			this.storageService.limpiarTodo(true);
		};
		let fecha = this.dateUtilsService.getCurrentDateTime();
		const data = {
			encriptado: await this.encriptar({ modo: 'dia', fecha})
			, RASTREO: FuncionesGenerales.rastreo('', 'TemparioApp')
		}
		this.httpClient.post(this.url, data, { headers: this.headers}).subscribe({
			next: resp => {
				this.peticionService.desencriptar(resp).then( resp => {
					this.eficiencia.next(resp);
				});
			},
			error: (error) => {
				this.validarAlertaError(error);
			}
		})
	}

	private validarAlertaError(request) {
		if (request.error !== '' && request.error != undefined) {
			let encabezado = 'Se ha producido un problema';
			let encabezado2 = 'Error';
			let opciones = [];
			let mensaje = 'Para obtener más información de este problema y posibles correcciones, pulse el botón "Ver Detalle" y comuniquese a la línea de servicio al cliente.';
			if (request.error.text !== '' && request.error.text != undefined) {
				mensaje = 'Para obtener más información de este problema y posibles correcciones, pulse el botón "Ver Detalle" y comuniquese a la línea de servicio al cliente.';
				opciones = [{
					text: 'Ver Detalle',
					handler: () => {
						this.notificacionesService.alerta(request.error.text, 'Error', ['alerta-error'],
							[{
								text: 'Cerrar',
								role: 'aceptar',
								handler: () => {
									if (this.nit !== '111111111') {
										this.storageService.limpiarTodo(true);
									}
								}
							}]
						);
					}
				}, {
					text: 'Cerrar',
					role: 'cancel',
					handler: () => {
						if (this.nit !== '111111111') {
							this.storageService.limpiarTodo(true);
						}
					}
				}];
			} else {
				// Verificar si request.error es string antes de usar includes
				if (typeof request.error === 'string' && request.error.includes('DELETE') && request.error.includes('REFERENCE') && request.error.includes('FK')) {
					mensaje = 'No se puede eliminar, el registro se encuentra referenciado en otras tablas.';
					encabezado = 'Error de Integridad';
					encabezado2 = encabezado;
				}
				opciones = [{
					text: 'Ver Detalle',
					handler: () => {
						this.notificacionesService.alerta(request.error, "Error", ['alerta-error'], [{ text: 'Cerrar', role: 'aceptar' }]);
					}
				}, {
					text: 'Cerrar',
					role: 'cancel'
				}];
			}
			this.notificacionesService.alerta(mensaje, encabezado, [], opciones);
		}
	}
}
