import { Component, ViewChild} from '@angular/core';
import { NavController,NavParams, Platform, ViewController, ToastController  } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
  terminos;

 constructor(public navCtrl: NavController, public params: NavParams,
            public userService: UserServiceProvider,
            public platform: Platform,
            private camera: Camera,
            private toastCtrl: ToastController,
            public viewCtrl: ViewController) {
            this.terminos = this.params.get('terminos');
            console.log(this.terminos);
 }
  dismiss() {
  this.viewCtrl.dismiss();
  }
  

  ionViewDidLoad() {
   console.log('User', this.terminos);
  }

}
