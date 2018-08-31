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
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild('signature') signatureArea;
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
  representante;
  showDatosRepresentante;
  representanteData: RepresentanteData;
  msgerror;
  imageCredential;

 constructor(public navCtrl: NavController, public params: NavParams,
            public userService: UserServiceProvider,
            public platform: Platform,
            private camera: Camera,
            private toastCtrl: ToastController,
            public viewCtrl: ViewController) {
              this.userInfo = JSON.parse(this.params.get('user'));
              this.representanteData = new RepresentanteData();
 }
  dismiss() {
  this.viewCtrl.dismiss();
  }
  entregarPaquete(){
    console.log(this.userInfo);
    this.showAreaSing();
   // this.signatureArea.setFocus();
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

  checkRepresentante() {
    console.log(this.representante);
    this.showDatosRepresentante = this.representante;
    if(this.representante){
      this.representanteData = {
        nombre: null,
        documentos: {
          copiacredencial: false,
          cartapoder: false
        }
      }
      console.log(this.representanteData);
    }
  }

  getPicture(){
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 100
    }
    this.camera.getPicture( options )
    .then(imageData => {
      this.imageCredential = `data:image/jpeg;base64,${imageData}`;
    })
    .catch(error =>{
      console.error( error );
    });
  }

  starComponent() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  cleanSingArea(){
    this.signaturePad.clear();
    this.presentToast('Falta firmar de entrega de paquete');
  }

  saveSing(){
    console.log(this.signaturePad.toDataURL());
    console.log(this.representanteData);
    const datos = {
      id: parseInt(this.userInfo.inscripcion, 10),
      img: this.signaturePad.toDataURL(),
      representante: (this.representanteData.nombre !== null) ? this.representanteData.nombre : null,
      docs: (this.representanteData !== undefined) ? JSON.stringify(this.representanteData.documentos) : null
    }
    console.log(this.representante);
    const firmaBlanco= new CanvasBlank();
    if(datos.img != firmaBlanco.img){
      if(this.representante){
          if(datos.representante !== null){
            if(this.representanteData.documentos.copiacredencial || this.representanteData.documentos.cartapoder){
              this.setInfoEntrega(datos);
            }else{
              this.msgerror = 'Falta un documento';
              this.presentToast('Falta un documento');
            }
          }else{
            this.msgerror = 'Debes ingresar un nombre de representante';
            this.presentToast('Debes ingresar un nombre de representante')
          }
      }else{
        this.setInfoEntrega(datos);
      }
    }else{
      this.msgerror = 'Falta firmar de entrega de paquete';
      this.presentToast('Falta firmar de entrega de paquete');
    }

  }

  setInfoEntrega(datos){
    this.userService.setKitEntregado(datos).subscribe(res => {
      console.log(res);
      if (res['error'] === 0) {
         this.userInfo.kit_entregado = res['msg'].fecha;
         this.representanteData.nombre =  res['msg'].nombre_representante;
         this.representanteData.documentos = JSON.parse(res['msg'].documentos);
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
   if(this.userInfo.representante !== null){
    this.representante = true;
    this.showDatosRepresentante = true;
    this.representanteData.nombre = this.userInfo.representante;
   }
   if(this.userInfo.docs !== null){
     this.showDatosRepresentante = true;
     this.representanteData.documentos = JSON.parse(this.userInfo.docs);
   }
   if(this.userInfo.firma_kit !== null){
     this.showFirma = true;
     this.showDatosRepresentante = true;
     this.imgFirma = this.userInfo.firma_kit;
   }
   console.log(this.productos);
   console.log('User', this.userInfo);
  }

}

class RepresentanteData{
  nombre: null;
  documentos: {
    copiacredencial: false;
    cartapoder: false;
  }
}

class etapasEntrega{
  paso1: false;
  paso2: false;
  paso3: false;
  paso4: false;
}

class CanvasBlank {
  img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAEsCAYAAAAhNGCdAAADRElEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwa0yAAAXNAY0UAAAAASUVORK5CYII=';
}
