import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificacionesService } from './notificaciones.service';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage
    , private router: Router
    , private modalController: ModalController
    , private notifcaciones: NotificacionesService
  ) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    this.storage = await this.storage.create();
  }

  set(llave: string, valor: any) {
    this.storage.set(llave, valor);
  }

  async get(llave: string) {
    return await this.storage.get(llave);
  }

  remove(llave: string) {
    this.storage.remove(llave);
  }

  limpiarTodo(logout?) {
    let tema = this.get('theme');
    let actividades = this.get('actividades');
    this.storage.clear();
    if (!logout) this.notifcaciones.alerta("Error de conexión", [{ text: 'Cerrar', role: 'aceptar' }]);
    if (!this.modalController) this.modalController.dismiss();
    this.set('theme', tema);
    this.set('actividades', actividades);
    this.router.navigateByUrl('login');
  }
}
