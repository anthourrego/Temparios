import { Injectable } from '@angular/core';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class ListaChequeoService extends PeticionService {

	constructor() {
		super();
	}

}
