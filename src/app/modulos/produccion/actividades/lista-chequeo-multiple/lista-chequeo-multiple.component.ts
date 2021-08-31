import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ListaChequeoService } from 'src/app/servicios/lista-chequeo.service';
import { ListaChequeoComponent } from '../lista-chequeo/lista-chequeo.component';

@Component({
	selector: 'app-lista-chequeo-multiple',
	templateUrl: './lista-chequeo-multiple.component.html',
	styleUrls: ['./lista-chequeo-multiple.component.scss'],
})
export class ListaChequeoMultipleComponent implements OnInit {

	@Input() datos;
	@Input() centroProduccion;
	arrGrupoLista: any = [];
	searching: boolean = false;
	mensaje: string = '';

	constructor(
		private modalController: ModalController,
		private listaChequeoService: ListaChequeoService
	) { }

	ngOnInit() {
		this.obtenerInformacion();
	}

	cerrarModal(listar?) {
		this.modalController.dismiss(listar);
	}

	obtenerInformacion() {
		let daticos = {
			grupo: this.datos?.GrupoId,
			centroProd: this.centroProduccion
		}
		this.searching = true;
		this.listaChequeoService.informacion(daticos, 'CentrosProduccion/obtenerGrupoListaChequeo').then(({ valido, datos, msg }) => {
			this.arrGrupoLista = datos;
			this.mensaje = msg;
			this.searching = false;
		}, err => {
			console.error(err);
			this.searching = false;
		});
	}

	async itemSeleccionado(option, pos) {
		if (!option['AplicoListaChequeo']) {
			const modal = await this.modalController.create({
				component: ListaChequeoComponent
				, backdropDismiss: false
				, componentProps: { datos: option }
			});
			await modal.present();
			modal.onWillDismiss().then(({ data, role }) => {
				if (data && data.listachequeo) {
					this.arrGrupoLista[pos]['AplicoListaChequeo'] = true;
				}
			}, console.error);
		}
	}

}
