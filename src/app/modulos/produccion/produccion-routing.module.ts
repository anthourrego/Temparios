import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProduccionPage } from './produccion.page';
import { EficienciaComponent } from './eficiencia/eficiencia.component';

const routes: Routes = [
	{
		path: '',
		component: ProduccionPage,
		children: [
			{
				path: 'historial',
				loadChildren: () => import('./historial/historial.module').then(m => m.HistorialPageModule)
			},
			{
				path: 'configuracion',
				loadChildren: () => import('./configuracion/configuracion.module').then(m => m.ConfiguracionPageModule)
			},
			{
				path: 'actividades',
				loadChildren: () => import('./actividades/actividades.module').then(m => m.ActividadesPageModule),
			},
			{
			  path: 'eficiencia', component: EficienciaComponent
			}
		]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ProduccionPageRoutingModule { }
