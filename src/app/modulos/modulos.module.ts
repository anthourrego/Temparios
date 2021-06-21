import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulosRoutingModule } from './modulos-routing.module';
import { IonicModule } from '@ionic/angular';
import { ModulosComponent } from './modulos.component';



@NgModule({
  declarations: [ModulosComponent],
  imports: [
    IonicModule,
    CommonModule,
    ModulosRoutingModule
  ]
})
export class ModulosModule { }
