import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RutasAutenticadoGuard } from './config/guards/rutas-autenticado.guard';
import { RutasNoAutenticadoGuard } from './config/guards/rutas-no-autenticado.guard';
import { ModulosComponent } from './modulos/modulos.component';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
	{
		path: 'modulos',
		component: ModulosComponent,
		canActivate: [RutasAutenticadoGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('./modulos/modulos.module').then(m => m.ModulosModule)
			}
		]
	},
	{
		canActivate: [RutasNoAutenticadoGuard],
		path: 'login',
		loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
