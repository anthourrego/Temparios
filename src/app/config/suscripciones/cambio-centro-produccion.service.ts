import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CambioCentroProduccionService {

	private subject$ = new Subject();

	constructor() { }

	cambio(value) {
		this.subject$.next(value);
	}

	/* Suscripcion para cuando se cambie el centro producción */
	suscripcion(): Observable<any> {
		return this.subject$;
	}

}
