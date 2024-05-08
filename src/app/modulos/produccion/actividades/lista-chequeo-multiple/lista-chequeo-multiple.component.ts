import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ListaChequeoService } from 'src/app/servicios/lista-chequeo.service';
import { ListaChequeoComponent } from '../lista-chequeo/lista-chequeo.component';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

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
		private listaChequeoService: ListaChequeoService,
		private notificacionesService: NotificacionesService,

	) { }

	ngOnInit() {
		this.obtenerInformacion();
	}

	cerrarModal(listar) {
		this.modalController.dismiss({ listar });
	}

	finalizarGrupo(listar?) {
		let dataListasChequeo = this.arrGrupoLista.map(l => l.dataLista ? l.dataLista : null);
		let validacionLisatas = dataListasChequeo.filter(l => l === null);
		if (validacionLisatas.length > 0) {
			this.notificacionesService.notificacion('Debe diligenciar todas las listas para poder finalizar el grupo');
			return;
		}
		this.modalController.dismiss({ listar, listachequeo: true, dataListasChequeo });
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
		const modal = await this.modalController.create({
			component: ListaChequeoComponent
			, backdropDismiss: false
			, componentProps: { datos: option, centroProduccion: this.centroProduccion }
		});
		await modal.present();
		modal.onWillDismiss().then(({ data, role }) => {
			if (data && data.listachequeo) {
				this.arrGrupoLista[pos]['AplicoListaChequeo'] = true;
				this.arrGrupoLista[pos]['dataLista'] = data.dataLista;
				this.arrGrupoLista[pos]['cantidadReproceso'] = data.dataLista.cantReproceso;
			}
		}, console.error);
	}

}
