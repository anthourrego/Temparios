import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'centros-produccion',
		loadChildren: () => import('./centros-produccion/centros-produccion.module').then(m => m.CentrosProduccionPageModule)
	},
	{
		path: 'produccion',
		loadChildren: () => import('./produccion/produccion.module').then(m => m.ProduccionPageModule)
	}
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ModulosRoutingModule { }
