import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'Crypto-js';
import * as moment from 'moment';
import { FuncionesGenerales } from '../config/funciones/funciones';

@Injectable({
	providedIn: 'root'
})
export class EficienciaService {

	private headers: HttpHeaders;
	private url = `${environment.urlBack}API/CentrosProduccion/Eficiencia`;
	private eficiencia = new Subject();
	private eficienciaModo = new Subject();
	eficiencia$ = this.eficiencia.asObservable();
	eficienciaModo$ = this.eficienciaModo.asObservable();

	constructor(
		private httpClient: HttpClient,
		private storageService: StorageService
	) {
		this.obtenerHeaders().then( () => {
			this.obtenerEficiencia();
		});
	}

	async obtenerHeaders() {
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		const Cedula = await this.storageService.get('nroDocumento').then(resp => resp);
		const indice = await this.storageService.get('indice').then(resp => resp);
		const Version = await this.storageService.get('version').then(resp => resp);
		let user = await this.desencriptar(JSON.parse(await this.storageService.get('usuario').then(resp => resp)));
		this.headers = new HttpHeaders({
			Token: '' + user.OperarioId
			, Conexion
			, Cedula
			, Nit: environment.nit
			, Usuario: '' + user.OperarioId
			, indice
			, Version: (Version || '')
			, NomUsuario: user.nombre
			, TurnoId: (user.TurnoId || '')
		});
		this.peticion();
	}

	async desencriptar(encriptado) {
		const salt = CryptoJS.enc.Hex.parse(encriptado.salt);
		const iv = CryptoJS.enc.Hex.parse(encriptado.iv);
		const crypt = JSON.parse(await this.storageService.get('crypt').then(resp => resp));
		const key = CryptoJS.PBKDF2(crypt.key, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: crypt.it });
		const decrypted = CryptoJS.AES.decrypt(encriptado.ciphertext, key, { iv: iv });
		try {
			return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
		} catch (err) {
			return decrypted.toString(CryptoJS.enc.Utf8)
		}
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
		}, 10000)
	}

	async peticion() {
		let fecha = moment().format('YY-MM-DD HH:mm:ss');
		const data = {
			encriptado: await this.encriptar({ modo: 'dia', fecha})
			, RASTREO: FuncionesGenerales.rastreo('', 'TemparioApp')
		}
		this.httpClient.post(this.url, data, { headers: this.headers}).subscribe( resp => {
			const respuesta = this.desencriptar(resp);
			respuesta.then((resp) => {
				this.eficiencia.next(resp);
			});
		})
	}

	async obtenerEficienciaModo(datos) {
		const data = {
			encriptado: await this.encriptar(datos)
			, RASTREO: FuncionesGenerales.rastreo('', 'TemparioApp')
		}
		this.httpClient.post(this.url, data, { headers: this.headers}).subscribe( resp => {
			const respuesta = this.desencriptar(resp);
			respuesta.then((resp) => {
				this.eficienciaModo.next(resp);
			});
		})
	}
}
