import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActividadesService } from 'src/app/servicios/actividades.service';

@Component({
    selector: 'app-caracteristicas',
    templateUrl: './caracteristicas.component.html',
    styleUrls: ['./caracteristicas.component.scss'],
    standalone: false
})
export class CaracteristicasComponent implements OnInit {

  @Input() datos;
	@Input() idGrupo;
  searching: boolean = true;
  caracteristicas: Array<object> = [];

  constructor(
    private modalController: ModalController,
    private actividadesService: ActividadesService,
  ) {}

  ngOnInit() {
		this.obtenerInformacion();
	}

  obtenerInformacion() {
		let datos = {
			grupoId: this.idGrupo
      ,pedidoId: this.datos
		};
		this.searching = true;
		this.actividadesService.informacion(datos, 'CentrosProduccion/obtenerCaracteristicas').then(({ valido, datos }) => {
      this.caracteristicas = datos;
			this.searching = false;
		}, err => {
			console.error(err);
			this.searching = false;
		});
	}

  cerrarModal() {
		this.modalController.dismiss();
	}



}
