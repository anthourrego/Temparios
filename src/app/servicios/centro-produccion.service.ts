import { Injectable } from '@angular/core';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class CentroProduccionService extends PeticionService {

	constructor() {
		super();
	}
}
