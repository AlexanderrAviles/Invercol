import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { VerNoticiaPageRoutingModule } from './ver-noticia-routing.module';

import { VerNoticiaPage } from './ver-noticia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    VerNoticiaPageRoutingModule,
  ],
  declarations: [VerNoticiaPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
})
export class VerNoticiaPageModule {}
