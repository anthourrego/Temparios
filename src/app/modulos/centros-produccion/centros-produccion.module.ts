import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CentrosProduccionPageRoutingModule } from './centros-produccion-routing.module';

import { CentrosProduccionPage } from './centros-produccion.page';
import { ConfiguracionPageModule } from '../produccion/configuracion/configuracion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CentrosProduccionPageRoutingModule,
	ConfiguracionPageModule
  ],
  declarations: [CentrosProduccionPage]
})
export class CentrosProduccionPageModule {}
