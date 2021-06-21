import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from 'src/app/servicios/storage.service';

@Injectable({
	providedIn: 'root'
})
export class RutasNoAutenticadoGuard implements CanActivate {

	constructor(
		private router: Router,
		private storageService: StorageService
	) { }

	async canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Promise<boolean> {
		let resp = await this.storageService.get('conexion').then(resp => resp);
		resp = JSON.parse(resp);
		if (!resp) {
			return true;
		}
		this.router.navigateByUrl('modulos/centros-produccion');
		return false;
	}

}
