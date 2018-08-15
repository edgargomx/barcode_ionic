import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { QRScanner } from '@ionic-native/qr-scanner';
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from '@angular/http';
import { File } from '@ionic-native/file';
import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { SignaturePadModule } from 'angular2-signaturepad';

import { MyApp } from './app.component';
import { HomePage, Profile } from '../pages/home/home';
import { UserServiceProvider } from '../providers/user-service/user-service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Profile
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    SignaturePadModule,
    IonicModule.forRoot(MyApp),   
    IonicStorageModule.forRoot() 
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    Profile,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    QRScanner,
    Camera,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserServiceProvider
  ]
})
export class AppModule {}
