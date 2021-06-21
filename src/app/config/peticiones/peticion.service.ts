import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'Crypto-js'
import { Observable } from 'rxjs';
import { StorageService } from '../../servicios/storage.service';
import { FuncionesGenerales } from '../funciones/funciones';

export class CustomInjectorService {
	static injector: Injector
}

@Injectable({
	providedIn: 'root'
})
export class PeticionService {

	private storageService: StorageService;
	private httpClient: HttpClient;
	private url: string = environment.urlBack;
	private llaveEncriptar: string = environment.secretoPeticion;
	public categoria: string = 'API/';

	constructor() {
		if (!this.httpClient) {
			this.httpClient = CustomInjectorService.injector.get<HttpClient>(HttpClient);
		}
		if (!this.storageService) {
			this.storageService = CustomInjectorService.injector.get<StorageService>(StorageService);
		}
	}

	encriptar(datos) {
		const salt = CryptoJS.lib.WordArray.random(256);
		const iv = CryptoJS.lib.WordArray.random(16);
		const key = CryptoJS.PBKDF2(this.llaveEncriptar, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });
		const encrypted = CryptoJS.AES.encrypt(JSON.stringify(datos), key, { iv: iv });
		const data = {
			ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
			salt: CryptoJS.enc.Hex.stringify(salt),
			iv: CryptoJS.enc.Hex.stringify(iv)
		}
		return JSON.stringify(data);
	}

	desencriptar(encriptado) {
		const salt = CryptoJS.enc.Hex.parse(encriptado.salt);
		const iv = CryptoJS.enc.Hex.parse(encriptado.iv);
		const key = CryptoJS.PBKDF2(this.llaveEncriptar, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });
		const decrypted = CryptoJS.AES.decrypt(encriptado.ciphertext, key, { iv: iv });
		return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
	}

	async obtener(controlador: string) {
		const uri = this.construirUrl(controlador);
		return await this.ejecutarPeticion('get', uri).toPromise().then(resp => this.desencriptar(resp), console.error);
	}

	async informacion(body: object | string | Array<any> | number, controlador: string) {
		const data = {
			encriptado: this.encriptar(body)
		}
		const uri = this.construirUrl(controlador);
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		const Cedula = await this.storageService.get('nroDocumento').then(resp => resp);
		const indice = await this.storageService.get('indice').then(resp => resp);
		let nit = this.desencriptar(JSON.parse(await this.storageService.get('usuario').then(resp => resp)));
		const headers = new HttpHeaders({ Token: '' + nit.OperarioId, Conexion, Cedula, Nit: environment.nit, Usuario: '' + nit.OperarioId, indice });
		return await this.ejecutarPeticion('post', uri, data, headers).toPromise().then(resp => {
			const desencriptado = this.desencriptar(resp);
			if (desencriptado.activoLogueo) {
				// return Ejecutar cerrar sesion
				this.storageService.limpiarTodo();
			} else {
				return desencriptado;
			}
		}, console.error);
	}

	private construirUrl(controlador) {
		return this.url + this.categoria + controlador;
	}

	async iniciarSesionUser(data) {
		data = {
			user: data.nroDocumento,
			clave: data.password,
			nit: environment.nit,
			RASTREO: FuncionesGenerales.rastreo('Ingresa al Sistema Process App', 'Ingreso Sistema'),
		};
		return await this.ejecutarPeticion('post', `${this.url}Login/ingresoOperario`, data).toPromise().then(resp => this.desencriptar(resp), console.error);
	}

	async cerrarSesionUser() {
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		let ingreso = this.desencriptar(JSON.parse(await this.storageService.get('ingreso').then(resp => resp)));

		let data = {
			ingreso: ingreso.IngresoId,
			usuario: ingreso.usuarioId
		};
		const headers = new HttpHeaders({ Conexion, Token: ingreso.IngresoId });
		return await this.ejecutarPeticion('post', `${this.url}Login/cierreMovil`, data, headers).toPromise().then(resp => this.desencriptar(resp), console.error);
	}

	ejecutarPeticion(verboPeticion: string, url: string, data?: object, headers?: HttpHeaders): Observable<any> {
		if (verboPeticion === 'get') {
			return this.httpClient.get(url);
		}
		return this.httpClient.post(url, data, { headers });
	}
}
