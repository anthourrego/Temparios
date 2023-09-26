import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProduccionPageRoutingModule } from './produccion-routing.module';

import { ProduccionPage } from './produccion.page';
import { ComponentesModule } from '../../componentes/componentes.module';
import { EficienciaComponent } from './eficiencia/eficiencia.component';
import { SemanasComponent } from 'src/app/componentes/semanas/semanas.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ProduccionPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ProduccionPage, EficienciaComponent, SemanasComponent]
})
export class ProduccionPageModule {}
