import { Component, OnInit } from '@angular/core';
import { EficienciaService } from 'src/app/servicios/eficiencia.service';
import * as moment from 'moment';
import { PopoverController } from '@ionic/angular';
import { SemanasComponent } from 'src/app/componentes/semanas/semanas.component';

@Component({
  selector: 'app-eficiencia',
  templateUrl: './eficiencia.component.html',
  styleUrls: ['./eficiencia.component.scss'],
})
export class EficienciaComponent implements OnInit {

  tiempoSeleccionado: any = { id: 1, color: '', porcentaje: '0%', tiempo: 'dia' };
  searching: boolean;
  modo: 'dia' | 'semana' | 'mes' = 'dia';
  fechaActual: any;
  fechaSeleccionada: any;
  fechaInicial: any;

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

  datos: any;

  constructor(
    private eficienciaService: EficienciaService,
    public popoverController: PopoverController
  ) {
  }

  ngOnInit() {
    this.fechaActual = moment().format('YYYY-MM-DD');
    this.fechaSeleccionada = new Date().toDateString();
    this.fechaInicial = moment().format('YY-MM-DD HH:mm:ss');
    // Se agrega el setTimeout debido que si inician en esta ruta la petición no alcanzaba a enviar los Headers
    setTimeout( () => {
      const data = {
        modo: this.modo,
        fecha: this.fechaInicial
      };
      this.eficienciaService.obtenerEficienciaModo(data);
    }, 1000)

    this.eficienciaService.eficienciaModo$.subscribe((resp: any) => {
      this.datos = resp.lista;
      this.cards[0].porcentaje = resp.dia.Eficiencia;
      this.cards[0].color = resp.dia.Color;
      this.cards[1].porcentaje = resp.semana.Eficiencia;
      this.cards[1].color = resp.dia.Color;
      this.cards[2].porcentaje = resp.mensual.Eficiencia;
      this.cards[2].color = resp.dia.Color;
    })
  }

  seleccionarRangoTiempo(card) {
    this.tiempoSeleccionado = card;
    this.modo = card.tiempo
    const data = {
      modo: this.modo,
      fecha: moment(this.fechaSeleccionada).format('YY-MM-DD HH:mm:ss')
    };
    this.eficienciaService.obtenerEficienciaModo(data);
  }

  cambioFecha() {
    const data = {
      modo: this.modo,
      fecha: moment(this.fechaSeleccionada).format('YY-MM-DD HH:mm:ss')
    };
    this.eficienciaService.obtenerEficienciaModo(data);
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

}
