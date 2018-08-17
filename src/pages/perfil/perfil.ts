import { Component, ViewChild} from '@angular/core';
import { NavController,NavParams, Platform, ViewController, ToastController  } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

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
 constructor(public navCtrl: NavController, public params: NavParams,
            public userService: UserServiceProvider,
            public platform: Platform, 
            private toastCtrl: ToastController,
            public viewCtrl: ViewController) {
              this.userInfo = JSON.parse(this.params.get('user'));
              this.representanteData = {
                nombre: '',
                documentos: {
                  copiacredencial: false,
                  cartapoder: false
                }
              }
 }
  dismiss() {
  this.viewCtrl.dismiss();
  }
  entregarPaquete(){
    console.log(this.userInfo);
    this.showAreaSing(); 
    this.signatureArea.setFocus();
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
    console.log(this.representanteData);
    const datos = {
      id: parseInt(this.userInfo.inscripcion, 10),
      img: this.signaturePad.toDataURL(),
      representante: (this.representanteData !== undefined) ? this.representanteData.nombre.toUpperCase() : null,
      docs: (this.representanteData !== undefined) ? JSON.stringify(this.representanteData.documentos) : null
    }
    if(this.representante){
        if(datos.representante !== ''){
          if(this.representante.documentos.copiacredencial || this.representante.documentos.cartapoder){
            if(datos.img != ''){
              this.setInfoEntrega(datos);
            }else{
              this.presentToast('Falta firmar de entrega de paquete');
            }
          }else{
            this.presentToast('Falta un documento');
          }
        }else{
          this.presentToast('Debes ingresar un nombre de representante')
        }
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

interface RepresentanteData{
  nombre: string;
  documentos: {
    copiacredencial: boolean;
    cartapoder: boolean;
  }
}
