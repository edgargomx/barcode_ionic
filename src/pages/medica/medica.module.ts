import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MedicaPage } from './medica';

@NgModule({
  declarations: [
    MedicaPage,
  ],
  imports: [
    IonicPageModule.forChild(MedicaPage),
  ],
})
export class MedicaPageModule {}
