import { Component, OnInit } from '@angular/core';
import { DateUtilsService } from 'src/app/servicios/date-utils.service';
import { PopoverController } from '@ionic/angular';
import { SemanasComponent } from 'src/app/componentes/semanas/semanas.component';
import { PeticionService } from 'src/app/config/peticiones/peticion.service';

@Component({
    selector: 'app-eficiencia',
    templateUrl: './eficiencia.component.html',
    styleUrls: ['./eficiencia.component.scss'],
    standalone: false
})
export class EficienciaComponent implements OnInit {

  tiempoSeleccionado: any = { id: 1, color: '', porcentaje: '0%', tiempo: 'dia' };
  searching: boolean;
  modo: 'dia' | 'semana' | 'mes' = 'dia';
  fechaActual: any;
  fechaSeleccionada: any;
  fechaInicial: any;
  datos: any;
  modalAbierto: boolean = false;

  cards = [
    {
      id: 1, color: '', porcentaje: '0', tiempo: 'dia'
    },
    {
      id: 2, color: '', porcentaje: '0', tiempo: 'semana'
    },
    {
      id: 3, color: '', porcentaje: '0', tiempo: 'mes'
    }
  ]

  constructor(
    private peticionService: PeticionService,
    public popoverController: PopoverController,
    private dateUtilsService: DateUtilsService
  ) {
  }

  ngOnInit() {
    this.fechaActual = this.dateUtilsService.getCurrentDate();
    this.fechaSeleccionada = new Date().toISOString();
    this.fechaInicial = this.dateUtilsService.getCurrentDateTime();

    const data = {
      modo: this.modo,
      fecha: this.fechaInicial
    };

    this.peticionService.informacion(data, 'CentrosProduccion/Eficiencia').then( resp => {
      this.recibirDatos(resp);
    })
  }

  seleccionarRangoTiempo(card) {
    this.tiempoSeleccionado = card;
    this.modo = card.tiempo
    const data = {
      modo: this.modo,
      fecha: this.dateUtilsService.formatToCustomDateTime(this.fechaSeleccionada)
    };
    this.peticionService.informacion(data, 'CentrosProduccion/Eficiencia').then( resp => {
      this.recibirDatos(resp);
    })
  }

  cambioFecha() {
    const data = {
      modo: this.modo,
      fecha: this.dateUtilsService.formatToCustomDateTime(this.fechaSeleccionada)
    };
    this.peticionService.informacion(data, 'CentrosProduccion/Eficiencia').then( resp => {
      this.recibirDatos(resp);
    })    
  }

  onFechaChange(event: any) {
    this.fechaSeleccionada = event.detail.value;
    this.cambioFecha();
    this.cerrarModal();
  }

  abrirCalendario() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  async verPopover(dato) {
    if (this.modo !== 'semana') return;
    const popover = await this.popoverController.create({
      component: SemanasComponent,
      event: dato,
      translucent: true,
      mode: 'ios',
      componentProps: { dato }
    });
    await popover.present();
  }


  private recibirDatos(resp) {
    this.datos = resp.lista;
    this.cards[0].porcentaje = resp.dia.Eficiencia;
    this.cards[0].color = resp.dia.Color;
    this.cards[1].porcentaje = resp.semana.Eficiencia;
    this.cards[1].color = resp.semana.Color;
    this.cards[2].porcentaje = resp.mensual.Eficiencia;
    this.cards[2].color = resp.mensual.Color;
  }

}
