import { Injectable } from '@angular/core';
import { PeticionService } from '../config/peticiones/peticion.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class InicioService extends PeticionService {

	constructor(
		private storage: Storage,
		private router: Router
	) {
		super();
		this.verificarCierreSesion();
	}

	async verificarCierreSesion() {
		const conexion = await this.storage.get('conexion');
		if (conexion) {
			this.informacion([], 'CentrosProduccion/inicioCierreForzado').then(({ valido, msg}) => {
				if (!valido) {
					this.notificacionesService.notificacion(msg);
					this.storage.remove('centroProduccion');
					this.storage.remove('centrosProduccion');
					this.storage.remove('conexion');
					this.storage.remove('usuario');
					this.router.navigateByUrl('/login');
				}
			});
		}
	}
}
