import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrincipalPage } from './principal';

import { File } from '@ionic-native/file';
import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    PrincipalPage,
  ],
  imports: [
    SignaturePadModule,
    IonicPageModule.forChild(PrincipalPage),
  ],
  providers: [
    Camera,
    File
  ]
})
export class PrincipalPageModule {}
