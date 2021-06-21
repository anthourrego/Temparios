import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProduccionPageRoutingModule } from './produccion-routing.module';

import { ProduccionPage } from './produccion.page';
import { ComponentesModule } from '../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProduccionPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ProduccionPage]
})
export class ProduccionPageModule {}
