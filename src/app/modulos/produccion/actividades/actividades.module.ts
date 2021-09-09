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
import { ListaChequeoComponent } from './lista-chequeo/lista-chequeo.component';
import { ListaChequeoMultipleComponent } from './lista-chequeo-multiple/lista-chequeo-multiple.component';
import { CaracteristicasComponent } from './caracteristicas/caracteristicas.component';

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
		, CaracteristicasComponent	
		, ProductoTerminadoComponent
		, ListaChequeoComponent
		, ListaChequeoMultipleComponent
	],
	providers: [],
	schemas: [NO_ERRORS_SCHEMA]
})

export class ActividadesPageModule { }
