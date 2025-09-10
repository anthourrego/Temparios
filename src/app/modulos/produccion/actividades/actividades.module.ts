import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActividadesPageRoutingModule } from './actividades-routing.module';
import { ActividadesPage } from './actividades.page';
import { AgregarActividadesComponent } from './agregar-actividades/agregar-actividades.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { ParadasComponent } from './paradas/paradas.component';
import { DetalleActividadComponent } from './detalle-actividad/detalle-actividad.component';
import { ProductoTerminadoComponent } from './producto-terminado/producto-terminado.component';
import { ListaChequeoComponent } from './lista-chequeo/lista-chequeo.component';
import { ListaChequeoMultipleComponent } from './lista-chequeo-multiple/lista-chequeo-multiple.component';
import { CaracteristicasComponent } from './caracteristicas/caracteristicas.component';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { DescargueAlmacenComponent } from './producto-terminado/descargue-almacen/descargue-almacen.component';
import { DescargueLoteComponent } from './producto-terminado/descargue-lote/descargue-lote.component';
import { CountupTimerComponent } from '../../../componentes/timer/countup-timer.component';
import { CountdownTimerComponent } from '../../../componentes/timer/countdown-timer.component';

@NgModule({
	imports: [
		CommonModule
		, FormsModule
		, IonicModule
		, ActividadesPageRoutingModule
		, PipesModule
		, RxReactiveFormsModule
		, ReactiveFormsModule
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
		, DescargueAlmacenComponent
		, DescargueLoteComponent
		, CountupTimerComponent
		, CountdownTimerComponent
	],
	providers: [],
	schemas: [NO_ERRORS_SCHEMA]
})

export class ActividadesPageModule { }
