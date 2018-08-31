import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductosPage } from './productos';
import { Camera } from '@ionic-native/camera';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    ProductosPage,
  ],
  imports: [
    SignaturePadModule,
    IonicPageModule.forChild(ProductosPage),
  ],
  providers: [
    Camera
  ]
})
export class ProductosPageModule {}
