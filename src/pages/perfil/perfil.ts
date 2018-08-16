import { Component, ViewChild, Renderer } from '@angular/core';
import { NavController,NavParams, Platform, Content, normalizeURL, ViewController, ToastController  } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { ModalController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 5,
    'canvasWidth': 700,
    'canvasHeight': 300
  };
  userInfo;
  productos = [];
  sexo;
  showFirma = false;
  imgFirma;
 constructor(params: NavParams,
            public userService: UserServiceProvider,
            public platform: Platform, 
            private toastCtrl: ToastController,
            public viewCtrl: ViewController) {
   this.userInfo = JSON.parse(params.get('user'));
   console.log(this.userInfo);

   if (this.userInfo.descr !== null) {
         let aux = this.userInfo.descr.replace('Inscripción,','')
         .replace(';Cargo por servicio,','')
         .replace(';Cargo por servicio','')
         .replace(',Cargo por servicio,','')
         .replace(',Cargo por servicio','')
         .replace('Cargo por servicio,','')
         .replace('Cargo por servicio','')
         .replace(',Descuento,','')
         .replace(',Descuento','')
         .replace('Descuento,','')
         .replace('Descuento','');
         if ( aux === "" ) {
          this.productos = ['NO HAY PRODUCTOS'];
         } else {
          aux = aux.split(',');
          if(aux[0] === ""){
            this.productos = ['NO HAY PRODUCTOS'];
          } else {
           this.productos = aux;
          }
         }
       }else{
         this.productos = ['NO HAY PRODUCTOS'];
       }
   if ( this.userInfo.catego_sexo === "0") {
    this.sexo = "Femenil";
   } else {
    this.sexo = "Varonil";
   }
   
   console.log(this.productos);
   console.log('User', this.userInfo);
 }
 dismiss() {
  this.viewCtrl.dismiss();
  }
  entregarPaquete(){
    console.log(this.userInfo);
    this.showAreaSing();    
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top',
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  showAreaSing(){
    this.showFirma = true;
    setTimeout(()=>{
      console.log('iniciando canvas..');
      this.starComponent();
    },1000);
  }

  starComponent() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }
  
  cleanSingArea(){
    this.signaturePad.clear();
  }

  saveSing(){
    console.log(this.signaturePad.toDataURL());

    this.userService.setKitEntregado(parseInt(this.userInfo.inscripcion, 10)).subscribe(res => {
      console.log(res);
      if (res['error'] === 0) {
         this.userInfo.kit_entregado = res['msg'];
         this.imgFirma = this.signaturePad.toDataURL();
      }else {
        console.log(res);
          this.presentToast(res['msg'])
      }
    });
  }

  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    console.log(this.signaturePad.toDataURL());
  }
 
  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('begin drawing');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PerfilPage');
  }

}
