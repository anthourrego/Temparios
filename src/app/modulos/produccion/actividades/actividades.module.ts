import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActividadesPageRoutingModule } from './actividades-routing.module';
import { ActividadesPage } from './actividades.page';
import { AgregarActividadesComponent } from './agregar-actividades/agregar-actividades.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { ParadasComponent } from './paradas/paradas.component';
import { DetalleActividadComponent } from './detalle-actividad/detalle-actividad.component';
import { ProductoTerminadoComponent } from './producto-terminado/producto-terminado.component';
import { NgxTimerModule } from 'ngx-timer';

@NgModule({
	imports: [
		CommonModule
		, FormsModule
		, IonicModule
		, ActividadesPageRoutingModule
		, PipesModule
		, NgxTimerModule
	],
	declarations: [
		ActividadesPage
		, AgregarActividadesComponent
		, ParadasComponent
		, DetalleActividadComponent
		, ProductoTerminadoComponent
	],
	providers: [],
	schemas: [NO_ERRORS_SCHEMA]
})

export class ActividadesPageModule { }
