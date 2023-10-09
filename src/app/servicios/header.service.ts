import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private rutaActiva = new Subject();
  rutaActiva$ = this.rutaActiva.asObservable();

  setRuta(ruta) {
    this.rutaActiva.next(ruta);
  }
}
