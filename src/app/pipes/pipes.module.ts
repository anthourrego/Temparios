import { NgModule } from '@angular/core';
import { CamelCasePipe } from './CamelCase/camel-case.pipe';
import { FiltroPipe } from './Filtro/filtro.pipe';

const PIPES = [
	FiltroPipe,
	CamelCasePipe
]

@NgModule({
	declarations: PIPES,
	exports: PIPES
})
export class PipesModule { }
