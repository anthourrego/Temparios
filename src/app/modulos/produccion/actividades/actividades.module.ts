import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActividadesPageRoutingModule } from './actividades-routing.module';

import { ActividadesPage } from './actividades.page';
import { AgregarActividadesComponent } from './agregar-actividades/agregar-actividades.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { ParadasComponent } from './paradas/paradas.component';
import { CountdownModule, CountdownGlobalConfig, CountdownConfig } from 'ngx-countdown';

function countdownConfigFactory(): CountdownConfig {
	return { format: `mm:ss` };
}

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ActividadesPageRoutingModule,
		PipesModule,
		CountdownModule,
	],
	declarations: [ActividadesPage, AgregarActividadesComponent, ParadasComponent],
	providers: [
		{ provide: CountdownGlobalConfig, useFactory: countdownConfigFactory }
	],
	schemas: [NO_ERRORS_SCHEMA]
})

export class ActividadesPageModule { }
