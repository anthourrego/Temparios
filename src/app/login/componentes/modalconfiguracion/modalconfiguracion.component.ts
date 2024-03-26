import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/servicios/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modalconfiguracion',
  templateUrl: './modalconfiguracion.component.html',
  styleUrls: ['./modalconfiguracion.component.scss'],
})
export class ModalconfiguracionComponent implements OnInit {

  cargando: boolean = false;
  formConfig = new FormGroup({
    nit: new FormControl(''),
    url: new FormControl('')
  })
  esTesting = !environment.production;
  urlToggle = false;

  constructor(
    private storage: StorageService,
    private modalController: ModalController,
    private toast: ToastController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.storage.get('usarUrlContingencia').then(valor => {
      if (valor) {
        this.urlToggle = valor;
      }
    });
		this.storage.get('nit').then(valor => {
      if (valor) {
        this.formConfig.controls.nit.setValue(valor);
      }
    });
    this.storage.get('urlSecundariaTesting').then(valor => {
      if (valor) {
        this.formConfig.controls.url.setValue(valor);
      }
    });
	}

  cerrarModal() {
		this.modalController.dismiss();
	}

  actualizarUrl(event: any) {
    this.urlToggle = event.detail.checked;
  }

  async guardar(){
    if (!environment.production && this.urlToggle && this.formConfig.value.url === '') {
      const toast = await this.toast.create({
        message: 'Debe ingresar una url de contingencia para testing',
        duration: 3000
      });
      await toast.present();
      return;
    }
    await this.storage.set('nit', this.formConfig.value.nit.toString());
    await this.storage.set('urlSecundariaTesting', this.formConfig.value.url);
    this.storage.set('usarUrlContingencia', this.urlToggle);
    this.modalController.dismiss();
  }

}
