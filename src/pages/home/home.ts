import { Component, Renderer } from '@angular/core';
import { NavController,NavParams, ToastController, LoadingController  } from 'ionic-angular';
import { BarcodeScanner ,BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { ModalController } from 'ionic-angular';
import { PerfilPage } from '../perfil/perfil';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  scanData : {};
  options :BarcodeScannerOptions;
  encodeData : string ;
  encodedData : {} ;
  userInfo;
  param ; // = '023f12b8e1d9987cc9a497bb7beeb93b';
  distancia;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private barcodeScanner: BarcodeScanner,
              public modalCtrl: ModalController,
              public renderer: Renderer,
              public loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              public userService: UserServiceProvider
            ) {

  }

  scan(){
    this.options = {
        prompt : "Escanear QR del participante"
    }
    this.barcodeScanner.scan(this.options).then((barcodeData) => {
        this.scanData = barcodeData;
        this.param = barcodeData.text;
        this.getInfoRunner();
    }, (err) => {
        console.log("Error occured : " + err);
    });
  }

  encodeText(){
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE,this.encodeData).then((encodedData) => {

        //console.log(encodedData);
        this.encodedData = encodedData;

    }, (err) => {
        console.log("Error occured : " + err);
    });
  }

  searchByCode(code, distancia) {
    this.param = code;
    console.log(distancia);
    if(code === '') {
      this.presentToast('Debes ingresar número de corredor');
    }else {
      if(code === '') {
        this.presentToast('Debes ingresar una distancia');
      }else {
        this.getInfoRunner();
      }
    }

  }

  getInfoRunner(){
    //console.log(this.param);
    let loader = this.loadingCtrl.create({
      content: "Buscando...",
      spinner: "bubbles"
    });
    loader.present();
    this.userService.getInfoRunner(this.param).subscribe(
      (response) => {
        const res = response; //JSON.parse(response.toString());
      //  console.log(res);
        if (res['error'] === 0){
          this.userInfo = res['msg'];
          //this.presentModal(this.userInfo);
          loader.dismiss();
          const params = { userInfo: JSON.stringify(this.userInfo)};
          this.navCtrl.push("InformacionPage", this.userInfo);
          //this.navCtrl.setRoot('InformacionPage', this.userInfo);
        }else{
          //console.log(res);
          loader.dismiss();
          this.presentToast(res['msg'])
        }

      },
      (error) => {
        loader.dismiss();
        console.error(error);
      }
    );
  }

  presentModal(user) {
    const modal = this.modalCtrl.create(PerfilPage, { user: JSON.stringify(user) });
    modal.present();
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }
}
