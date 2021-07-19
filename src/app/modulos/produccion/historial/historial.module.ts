import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialPageRoutingModule } from './historial-routing.module';

import { HistorialPage } from './historial.page';
import { FiltrosHistorialComponent } from './filtros-historial/filtros-historial.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HistorialPageRoutingModule
  ],
  declarations: [HistorialPage, FiltrosHistorialComponent]
})
export class HistorialPageModule {}
