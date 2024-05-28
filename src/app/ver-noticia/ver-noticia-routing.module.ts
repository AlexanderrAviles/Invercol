import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerNoticiaPage } from './ver-noticia.page';

const routes: Routes = [
  {
    path: '',
    component: VerNoticiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerNoticiaPageRoutingModule {}
