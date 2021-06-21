import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CentrosProduccionPage } from './centros-produccion.page';

const routes: Routes = [
  {
    path: '',
    component: CentrosProduccionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CentrosProduccionPageRoutingModule {}
