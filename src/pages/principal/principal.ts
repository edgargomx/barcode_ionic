import { Component, Renderer, ViewChild } from '@angular/core';
import { IonicPage, NavController,NavParams, ToastController, LoadingController, Content, AlertController, ModalController } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { PerfilPage } from '../perfil/perfil';

@IonicPage()
@Component({
  selector: 'page-principal',
  templateUrl: 'principal.html',
})
export class PrincipalPage {
  @ViewChild(Content) content: Content;
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild('signature') signatureArea;
  private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 5,
    'canvasWidth': 700,
    'canvasHeight': 300
  };

  productos = [];
  sexo;
  showFirma = false;
  imgFirma;
  representante= false;
  showDatosRepresentante;
  representanteData: RepresentanteData;
  msgerror;
  imageCredential;
  beneficiario = '';
  imageCredentialFront;
  imageCredentialBack;
  picture =  {
    front: false,
    back: false,
    message: 'Frontal'
  }
  userInfo;
  loader;
  firma_ok = false;
  playera_ok = false;
  terminos;

  constructor(public navCtrl: NavController, public navParams: NavParams,
             public userService: UserServiceProvider,
             public modalCtrl: ModalController,
             public loadingCtrl: LoadingController,
             private camera: Camera,
             private alertCtrl: AlertController,
             private toastCtrl: ToastController
            ) {
              this.userInfo = navParams.data;
              this.representanteData = new RepresentanteData();
              this.getTerminos();
              this.loader = this.loadingCtrl.create({
                content: "Guardando...",
                spinner: "bubbles"
              });
              
  }

  close(){
    //this.navCtrl.setRoot('HomePage');
    this.navCtrl.pop();
  }
  entregarPaquete(){
    console.log(this.userInfo);
    this.showAreaSing();
   // this.signatureArea.setFocus();
  }

  presentModal() {
    const modal = this.modalCtrl.create(PerfilPage, { terminos: this.terminos });
    modal.present();
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
    this.representante = false;
    this.representanteData = new RepresentanteData();
    console.log(this.representanteData);
    setTimeout(()=>{
      console.log('iniciando canvas..');
      this.starComponent();
    },1000);
  }

  checkRepresentante() {
    console.log(this.representante);
    this.showDatosRepresentante = this.representante;
    if(this.representante){
      console.log(this.representanteData);
    }
  }

  getTerminos(){
    this.userService.getInfoEvento().subscribe(res => {
      console.log(res);
      if(res['error'] == 0){
        this.terminos = res['msg'].terminos;
      }
    });
  }

  getPicture(){
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 500,
      targetHeight: 500,
      quality: 100
    }
    this.camera.getPicture( options )
    .then(imageData => {
      const singBlanco= new CanvasBlank();    
      if(!this.picture.front){
        this.picture.front = true;
        this.picture.message = 'Trasera';
        this.imageCredentialFront = `data:image/jpeg;base64,${imageData}`;
        // this.imageCredentialFront = singBlanco.ine;
      }else {
        this.picture.back = true;        
        this.imageCredentialBack = `data:image/jpeg;base64,${imageData}`;
        // this.imageCredentialFront = singBlanco.ine;
      }
      
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
    this.signaturePad.on();
    this.firma_ok = false;
    //this.presentToast('Falta firmar de entrega de paquete');
  }

  setFirma(){          
    this.presentConfirm();
  }

  saveShirtRunner(){
    this.userService.postShirtRunner(this.userInfo.inscripcion).subscribe(res =>{
      console.log(res);
      if(res['error'] == 0) {
        this.playera_ok = true;
      }
    });
  }

  saveSing(){
    console.log(this.imageCredentialFront)
    const datos = {
      id: parseInt(this.userInfo.inscripcion, 10),
      img_firma: this.signaturePad.toDataURL(),
      img_credencial_front: this.imageCredentialFront,
      img_credencial_back: this.imageCredentialBack,
      representante:  null,
      docs: null,
      beneficiario: this.beneficiario
    }
    const firmaBlanco= new CanvasBlank();
    //datos.img_credencial_front =  firmaBlanco.ine;
    if(datos.img_firma != firmaBlanco.img2 && datos.img_firma != firmaBlanco.img1){
      if(this.representante){
          if(this.representanteData.nombre !== null || this.representanteData.nombre != undefined){
            datos.representante = this.representanteData.nombre.toUpperCase();
            if(this.representanteData.documentos.copiacredencial || 
                this.representanteData.documentos.cartaexoneracion || 
                this.representanteData.documentos.cartapoder){
              datos.docs = JSON.stringify(this.representanteData.documentos)
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
        datos.docs = JSON.stringify(this.representanteData.documentos)
        this.setInfoEntrega(datos);
      }
    }else{
      this.msgerror = 'Falta firmar de entrega de paquete';
      this.presentToast('Falta firmar de entrega de paquete');
    }

  }

  setInfoEntrega(datos){
    this.loader.present();
    this.userService.setKitEntregado(datos).subscribe(res => {
      console.log(res);
      if (res['error'] === 0) {
        this.loader.dismiss();
         this.userInfo.kit_entregado = res['msg'].fecha;
         this.representanteData.nombre =  (res['msg'].nombre_representante === null) ? this.userInfo.nombre : res['msg'].nombre_representante ;
         this.representanteData.documentos = JSON.parse(res['msg'].documentos);
         console.log(this.representanteData);
         this.imgFirma = this.signaturePad.toDataURL();
          this.imageCredential = res['msg'].img_credencial;
      }else {
        console.log(res);
          this.loader.dismiss();
          this.presentToast(res['msg'])
      }
    });
  }

  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: '¿Aceptas la exoneración?',
      //message: 'Estas de acuerdo con la carta de exoneración',
      inputs: [
        {
          name: 'terminos',
          type: 'checkbox',
          label: 'Sí, estoy de acuerdo',
          value: '1',
          checked: false
        }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Acepto',
          handler: (data) => {
            if(data[0] === '1') {
              this.signaturePad.off(); 
              this.firma_ok = true;
            }
            
            console.log('Buy clicked', data);
          }
        }
      ]
    });
    alert.present();
  }

  ionViewDidLoad() {
    this.signaturePadOptions = { // passed through to szimek/signature_pad constructor
      'minWidth': 5,
      'canvasWidth': this.content.getContentDimensions().contentWidth - 10,
      'canvasHeight': 300
    };

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
   }else{
    this.representanteData.nombre = this.userInfo.nombre;
   }
   if(this.userInfo.docs !== null){
     //this.showDatosRepresentante = true;
     this.representanteData.documentos = JSON.parse(this.userInfo.docs);
   }else { this.representanteData = new RepresentanteData(); }
   if(this.userInfo.firma_kit !== null){
     this.showFirma = true;
     this.imgFirma = this.userInfo.firma_kit;
     this.imageCredentialFront = this.userInfo.ine_kit;
     this.imageCredentialBack = this.userInfo.ine_kit_b;
   }
   if(this.userInfo.playera_corredor != null){
      this.playera_ok = true;
   }
   console.log('User', this.userInfo);
  }

  calcularEdad(fecha) {
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }

    return edad;
  }

  inputUppercase(){
    this.beneficiario = this.beneficiario.toUpperCase();
  }
}

class RepresentanteData{
  nombre= null;
  documentos = new Documentos();
}
class Documentos {
  cartaexoneracion = false;
  copiacredencial= false;
  cartapoder= false;
}

class CanvasBlank {
  img1='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAEsCAYAAAAhNGCdAAAQuUlEQVR4Xu3WQREAAAgCQelf2h43awMWH+wcAQIECBAgQIAAgbDAwtlEI0CAAAECBAgQIHAGrycgQIAAAQIECBBICxi86XqFI0CAAAECBAgQMHj9AAECBAgQIECAQFrA4E3XKxwBAgQIECBAgIDB6wcIECBAgAABAgTSAgZvul7hCBAgQIAAAQIEDF4/QIAAAQIECBAgkBYweNP1CkeAAAECBAgQIGDw+gECBAgQIECAAIG0gMGbrlc4AgQIECBAgAABg9cPECBAgAABAgQIpAUM3nS9whEgQIAAAQIECBi8foAAAQIECBAgQCAtYPCm6xWOAAECBAgQIEDA4PUDBAgQIECAAAECaQGDN12vcAQIECBAgAABAgavHyBAgAABAgQIEEgLGLzpeoUjQIAAAQIECBAweP0AAQIECBAgQIBAWsDgTdcrHAECBAgQIECAgMHrBwgQIECAAAECBNICBm+6XuEIECBAgAABAgQMXj9AgAABAgQIECCQFjB40/UKR4AAAQIECBAgYPD6AQIECBAgQIAAgbSAwZuuVzgCBAgQIECAAAGD1w8QIECAAAECBAikBQzedL3CESBAgAABAgQIGLx+gAABAgQIECBAIC1g8KbrFY4AAQIECBAgQMDg9QMECBAgQIAAAQJpAYM3Xa9wBAgQIECAAAECBq8fIECAAAECBAgQSAsYvOl6hSNAgAABAgQIEDB4/QABAgQIECBAgEBawOBN1yscAQIECBAgQICAwesHCBAgQIAAAQIE0gIGb7pe4QgQIECAAAECBAxeP0CAAAECBAgQIJAWMHjT9QpHgAABAgQIECBg8PoBAgQIECBAgACBtIDBm65XOAIECBAgQIAAAYPXDxAgQIAAAQIECKQFDN50vcIRIECAAAECBAgYvH6AAAECBAgQIEAgLWDwpusVjgABAgQIECBAwOD1AwQIECBAgAABAmkBgzddr3AECBAgQIAAAQIGrx8gQIAAAQIECBBICxi86XqFI0CAAAECBAgQMHj9AAECBAgQIECAQFrA4E3XKxwBAgQIECBAgIDB6wcIECBAgAABAgTSAgZvul7hCBAgQIAAAQIEDF4/QIAAAQIECBAgkBYweNP1CkeAAAECBAgQIGDw+gECBAgQIECAAIG0gMGbrlc4AgQIECBAgAABg9cPECBAgAABAgQIpAUM3nS9whEgQIAAAQIECBi8foAAAQIECBAgQCAtYPCm6xWOAAECBAgQIEDA4PUDBAgQIECAAAECaQGDN12vcAQIECBAgAABAgavHyBAgAABAgQIEEgLGLzpeoUjQIAAAQIECBAweP0AAQIECBAgQIBAWsDgTdcrHAECBAgQIECAgMHrBwgQIECAAAECBNICBm+6XuEIECBAgAABAgQMXj9AgAABAgQIECCQFjB40/UKR4AAAQIECBAgYPD6AQIECBAgQIAAgbSAwZuuVzgCBAgQIECAAAGD1w8QIECAAAECBAikBQzedL3CESBAgAABAgQIGLx+gAABAgQIECBAIC1g8KbrFY4AAQIECBAgQMDg9QMECBAgQIAAAQJpAYM3Xa9wBAgQIECAAAECBq8fIECAAAECBAgQSAsYvOl6hSNAgAABAgQIEDB4/QABAgQIECBAgEBawOBN1yscAQIECBAgQICAwesHCBAgQIAAAQIE0gIGb7pe4QgQIECAAAECBAxeP0CAAAECBAgQIJAWMHjT9QpHgAABAgQIECBg8PoBAgQIECBAgACBtIDBm65XOAIECBAgQIAAAYPXDxAgQIAAAQIECKQFDN50vcIRIECAAAECBAgYvH6AAAECBAgQIEAgLWDwpusVjgABAgQIECBAwOD1AwQIECBAgAABAmkBgzddr3AECBAgQIAAAQIGrx8gQIAAAQIECBBICxi86XqFI0CAAAECBAgQMHj9AAECBAgQIECAQFrA4E3XKxwBAgQIECBAgIDB6wcIECBAgAABAgTSAgZvul7hCBAgQIAAAQIEDF4/QIAAAQIECBAgkBYweNP1CkeAAAECBAgQIGDw+gECBAgQIECAAIG0gMGbrlc4AgQIECBAgAABg9cPECBAgAABAgQIpAUM3nS9whEgQIAAAQIECBi8foAAAQIECBAgQCAtYPCm6xWOAAECBAgQIEDA4PUDBAgQIECAAAECaQGDN12vcAQIECBAgAABAgavHyBAgAABAgQIEEgLGLzpeoUjQIAAAQIECBAweP0AAQIECBAgQIBAWsDgTdcrHAECBAgQIECAgMHrBwgQIECAAAECBNICBm+6XuEIECBAgAABAgQMXj9AgAABAgQIECCQFjB40/UKR4AAAQIECBAgYPD6AQIECBAgQIAAgbSAwZuuVzgCBAgQIECAAAGD1w8QIECAAAECBAikBQzedL3CESBAgAABAgQIGLx+gAABAgQIECBAIC1g8KbrFY4AAQIECBAgQMDg9QMECBAgQIAAAQJpAYM3Xa9wBAgQIECAAAECBq8fIECAAAECBAgQSAsYvOl6hSNAgAABAgQIEDB4/QABAgQIECBAgEBawOBN1yscAQIECBAgQICAwesHCBAgQIAAAQIE0gIGb7pe4QgQIECAAAECBAxeP0CAAAECBAgQIJAWMHjT9QpHgAABAgQIECBg8PoBAgQIECBAgACBtIDBm65XOAIECBAgQIAAAYPXDxAgQIAAAQIECKQFDN50vcIRIECAAAECBAgYvH6AAAECBAgQIEAgLWDwpusVjgABAgQIECBAwOD1AwQIECBAgAABAmkBgzddr3AECBAgQIAAAQIGrx8gQIAAAQIECBBICxi86XqFI0CAAAECBAgQMHj9AAECBAgQIECAQFrA4E3XKxwBAgQIECBAgIDB6wcIECBAgAABAgTSAgZvul7hCBAgQIAAAQIEDF4/QIAAAQIECBAgkBYweNP1CkeAAAECBAgQIGDw+gECBAgQIECAAIG0gMGbrlc4AgQIECBAgAABg9cPECBAgAABAgQIpAUM3nS9whEgQIAAAQIECBi8foAAAQIECBAgQCAtYPCm6xWOAAECBAgQIEDA4PUDBAgQIECAAAECaQGDN12vcAQIECBAgAABAgavHyBAgAABAgQIEEgLGLzpeoUjQIAAAQIECBAweP0AAQIECBAgQIBAWsDgTdcrHAECBAgQIECAgMHrBwgQIECAAAECBNICBm+6XuEIECBAgAABAgQMXj9AgAABAgQIECCQFjB40/UKR4AAAQIECBAgYPD6AQIECBAgQIAAgbSAwZuuVzgCBAgQIECAAAGD1w8QIECAAAECBAikBQzedL3CESBAgAABAgQIGLx+gAABAgQIECBAIC1g8KbrFY4AAQIECBAgQMDg9QMECBAgQIAAAQJpAYM3Xa9wBAgQIECAAAECBq8fIECAAAECBAgQSAsYvOl6hSNAgAABAgQIEDB4/QABAgQIECBAgEBawOBN1yscAQIECBAgQICAwesHCBAgQIAAAQIE0gIGb7pe4QgQIECAAAECBAxeP0CAAAECBAgQIJAWMHjT9QpHgAABAgQIECBg8PoBAgQIECBAgACBtIDBm65XOAIECBAgQIAAAYPXDxAgQIAAAQIECKQFDN50vcIRIECAAAECBAgYvH6AAAECBAgQIEAgLWDwpusVjgABAgQIECBAwOD1AwQIECBAgAABAmkBgzddr3AECBAgQIAAAQIGrx8gQIAAAQIECBBICxi86XqFI0CAAAECBAgQMHj9AAECBAgQIECAQFrA4E3XKxwBAgQIECBAgIDB6wcIECBAgAABAgTSAgZvul7hCBAgQIAAAQIEDF4/QIAAAQIECBAgkBYweNP1CkeAAAECBAgQIGDw+gECBAgQIECAAIG0gMGbrlc4AgQIECBAgAABg9cPECBAgAABAgQIpAUM3nS9whEgQIAAAQIECBi8foAAAQIECBAgQCAtYPCm6xWOAAECBAgQIEDA4PUDBAgQIECAAAECaQGDN12vcAQIECBAgAABAgavHyBAgAABAgQIEEgLGLzpeoUjQIAAAQIECBAweP0AAQIECBAgQIBAWsDgTdcrHAECBAgQIECAgMHrBwgQIECAAAECBNICBm+6XuEIECBAgAABAgQMXj9AgAABAgQIECCQFjB40/UKR4AAAQIECBAgYPD6AQIECBAgQIAAgbSAwZuuVzgCBAgQIECAAAGD1w8QIECAAAECBAikBQzedL3CESBAgAABAgQIGLx+gAABAgQIECBAIC1g8KbrFY4AAQIECBAgQMDg9QMECBAgQIAAAQJpAYM3Xa9wBAgQIECAAAECBq8fIECAAAECBAgQSAsYvOl6hSNAgAABAgQIEDB4/QABAgQIECBAgEBawOBN1yscAQIECBAgQICAwesHCBAgQIAAAQIE0gIGb7pe4QgQIECAAAECBAxeP0CAAAECBAgQIJAWMHjT9QpHgAABAgQIECBg8PoBAgQIECBAgACBtIDBm65XOAIECBAgQIAAAYPXDxAgQIAAAQIECKQFDN50vcIRIECAAAECBAgYvH6AAAECBAgQIEAgLWDwpusVjgABAgQIECBAwOD1AwQIECBAgAABAmkBgzddr3AECBAgQIAAAQIGrx8gQIAAAQIECBBICxi86XqFI0CAAAECBAgQMHj9AAECBAgQIECAQFrA4E3XKxwBAgQIECBAgIDB6wcIECBAgAABAgTSAgZvul7hCBAgQIAAAQIEDF4/QIAAAQIECBAgkBYweNP1CkeAAAECBAgQIGDw+gECBAgQIECAAIG0gMGbrlc4AgQIECBAgAABg9cPECBAgAABAgQIpAUM3nS9whEgQIAAAQIECBi8foAAAQIECBAgQCAtYPCm6xWOAAECBAgQIEDA4PUDBAgQIECAAAECaQGDN12vcAQIECBAgAABAgavHyBAgAABAgQIEEgLGLzpeoUjQIAAAQIECBAweP0AAQIECBAgQIBAWsDgTdcrHAECBAgQIECAgMHrBwgQIECAAAECBNICBm+6XuEIECBAgAABAgQMXj9AgAABAgQIECCQFjB40/UKR4AAAQIECBAgYPD6AQIECBAgQIAAgbSAwZuuVzgCBAgQIECAAAGD1w8QIECAAAECBAikBQzedL3CESBAgAABAgQIGLx+gAABAgQIECBAIC1g8KbrFY4AAQIECBAgQMDg9QMECBAgQIAAAQJpAYM3Xa9wBAgQIECAAAECBq8fIECAAAECBAgQSAsYvOl6hSNAgAABAgQIEDB4/QABAgQIECBAgEBawOBN1yscAQIECBAgQICAwesHCBAgQIAAAQIE0gIGb7pe4QgQIECAAAECBAxeP0CAAAECBAgQIJAWMHjT9QpHgAABAgQIECBg8PoBAgQIECBAgACBtIDBm65XOAIECBAgQIAAAYPXDxAgQIAAAQIECKQFDN50vcIRIECAAAECBAgYvH6AAAECBAgQIEAgLWDwpusVjgABAgQIECBAwOD1AwQIECBAgAABAmkBgzddr3AECBAgQIAAAQIGrx8gQIAAAQIECBBICxi86XqFI0CAAAECBAgQMHj9AAECBAgQIECAQFrA4E3XKxwBAgQIECBAgIDB6wcIECBAgAABAgTSAgZvul7hCBAgQIAAAQIEDF4/QIAAAQIECBAgkBYweNP1CkeAAAECBAgQIGDw+gECBAgQIECAAIG0gMGbrlc4AgQIECBAgACBB/i0AS3kXFFDAAAAAElFTkSuQmCC';

  img2='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAEsCAYAAAAhNGCdAAADRElEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwa0yAAAXNAY0UAAAAASUVORK5CYII=';

  ine='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAEsCAYAAAAhNGCdAAAgAElEQVR4Xu3dCbBtWVkf8L8iTUAmERkEB0xT0KgNCGrjxCQRGwQaUQQFBQsRTBQHEhViKqUxQbQkJWISUYgRjEODIKOzgjSTMgg0iIooICiDyDynPntfeN25790zfPucdc757apb73W/vb/1rd86957v7rP2Wp8UBwECBAgQIECAAIE9FvikPe6brhEgQGA0gc9O8ugkX3eGxG6W5GWjJS4fAgQI7LKAgneXR0/uBAjsgsB5SS5aMtH7J3ncktc4nQABAgROI6Dg9dIgQIBAv8AVk/zqCXdyT2r1OknectJJ/p0AAQIEThZQ8J5s5AwCBAgsIvDJSR6S5KcWOXmBcy5OcpMFznMKAQIECJwgoOD1EiFAgMB6AtdN8tQkt1wvzLFX+xk9A6qQBAgcnoAfpoc35npMgECPwNWSvCTJDXrCKXhndBSaAIEDF1DwHvgLQPcJEFha4BZJXrz0Vctf8M4kV1/+MlcQIECAwGUFFLxeEwQIEFhM4C5JnrLYqS1nnZ3kr1oiCUKAAIEDF1DwHvgLQPcJEDijQP2M/KYkT9yw04VJ7rHhNjVHgACBvRVQ8O7t0OoYAQJrClyQ5Elrxljl8n+b5GdXudA1BAgQIHC8gILXK4MAAQKfEKifid+f5JFbQqn1e9+/pbaPa/ZyST4rSa0J/IYkb0zysYHykwoBAgQWElDwLsTkJAIE9lzgCkl+Kck3bqmfz0hypy21fbpmf3Iq/k/99w8l+ZIkLx0sV+kQIEDgjAIKXi8QAgQOWaAK3WcnufWWEf50pnV8l+1WbZ5x3wW2Nf7qJL+3bHDnEyBAYFsCCt5tyWuXAIFtClRhV/Nz77rNJE5p+7FJHrChXGraxI2SfEOSByX5tBXarWkNFecDK1zrEgIECGxcQMG7cXINEiCwRYEq0mou6jW2mMNxTdc0gRc15HStJLdLcsck35Kk5uDOddwvyePnCi4uAQIEOgUUvJ2aYhEgMKpA7Yr21iSfMlOCH05yvSSfk+SFK7RRd5wv+zBY5XxOkutPD47dJsltk1xlhfhzXFJznr91jsBiEiBAoFtAwdstKh4BAiMJ1BzdOVc9+PUk90rykVM6/V1JHj0Swky5/O8k3zZTbGEJECDQKqDgbeUUjACBQQTOmnl+aRW6D0zyjmP6+yvTZhWDUMyWxtcledps0QUmQIBAo4CCtxFTKAIEti5QUxZqO97PnimTWqrroSfEru2HaxvifT9qfvBH972T+keAwH4IKHj3Yxz1gsChC9Qd3VcnucFMELWKwndeZurC6Zp6zLT6wUypDBG26yG7ITojCQIE9l9Awbv/Y6yHBPZdoObL1rzZOY5a6eAJSwauh8v+YMlrdun0L0ty0S4lLFcCBAgoeL0GCBDYVYG7J7lwpuTPT/LMFWPXigunPsS2YpghLztuNYkhE5UUAQIEThVQ8Ho9ECCwawL1cfoLZkp6lTu6x6Vy+yS/O1OO2wi7zi8A28hXmwQIELiUgILXC4IAgV0RqE0j3jtTst+b5FHNsb89Sc393fXDXd1dH0H5EyAQBa8XAQECuyDwpiTXnSHR+yd53Axxj0JeO8mbZ4w/Z+j7JPnlORsQmwABApsSUPBuSlo7BAisIvDwJD+6yoUnXPOADd99vXyS6stDkly1oT8vnqZ1PC/JW5K8JMnbj4l72d3bFm36pklevujJziNAgMDoAgre0UdIfgQOU+CCJE+aoesPSvI/Zoi7asj6GfwFSa6Z5FOnIK9P8uerBjzluvPWXE3hs5K8oSEPIQgQILB1AQXv1odAAgQOVqC2/T03yR2S1CYGz0ryvqZi77KoVeRWsXtIR8eObzaXOKRXjL4S2GMBBe8eD66uEZhRoAqhz52KyNpi98oztrVO6Nr69xrrBNjha2vb3zutmX9d/4w1Y7icAAECWxdQ8G59CCRAYDiBKl7PSVIPLX1tkrOHy7AvoZoLW4Xhryf5yyQf7Au99Ui/mOR+a2ZRxe66RfOaKbicAAEC6wsoeNc3FIHALgpcZ9oq985JbrGLHdhSzjXt4jXTA2O1RNobp/9+15byOVOzHWsB/82M2zUPSCYlAgT2VUDBu68jq18EkqsluUeSByf5IiBbE6hi+GVJnjvdSb54mqs8d0IdO749OUntaNd5XGmaDlPrKr/uNKtLdLYnFgECBKzD6zVAYMcFan5qrSX7VUlu3bTk1Y6T7Gz6j0jyyCRva+zBFyd5YVO8P0ny7CS/k+RVSf55ibi1FFsty/bQY675cJLrJfmHJeI5lQABAksJuMO7FJeTCWxFoNZwvc00p/auitqtjME2G/3JaS3iZQrMU/OtOdiv3WYHFmz786Y7vgue7jQCBAgsLqDgXdzKmQTmFqjCtpbo+pkk9ebvIHA6gTtOd1uXEapPAeru7FnLXLThcy2DtmFwzRE4FAEF76GMtH6OJFCbDHxFkh9OUh85OwisI/ChJDeZVpk4Kc4fTJ8WnHTetv69fuH73W01rl0CBPZXQMG7v2OrZ2MI3CjJ45Lcaox0ZHEAAo9N8rDTzIn9ziQ/N7DBE5J8y8D5SY0AgR0VUPDu6MBJeziB+pi4toh9TJIvHS47CR2ywFdOK0SUQa3cUGsN19SBEY9nJjl/xMTkRIDAbgsoeHd7/GS/PYEbTA8SffP2Utjrlo+Ww/rYXvdy852rVRb+U5Lnb77phVq8d5LaEtlBgACBVgEFbyunYHsscPPpYbIv3+M+nqlrNa/y6VOh9Gen3CWs+aPdP0dqndb3TckoeA/rBfcpST5yWF3WWwIENiHQ/Ua1iZy1QWATAvW9UUuA1Z3GQzieM22K8IJp57B3ntDpnzjNmqrrWF1/2rns1BgK3nVEd+va2yWph+ocBAgQaBdQ8LaTCrjDAvWG+3s7nP+ZUv/r6Q71S5JUMfvSFft57rRr2IqXH3tZrVTx4tMEfJ4H/jqph411yyR/Omx2EiNAYOcFFLw7P4Q6sIZAvf7vluRJa8QY6dL6KPhF013pZyR5RWNyZfXRxngV6t9PO4udKey/2tA2vM1dE24JgVOnsCxxmVMJECCwuICCd3ErZ+6PwLWTvHmHu1NbsD4lyf9JUlMR5j7q7ustGht5apK7LzFX82ZJ6s703EdtcfvgJL823QVfpb0rJ6lNIW47xVolxqFcc8/J+lD6q58ECGxRQMG7RXxNb1SgCpHf37GNHmq91JpicVGSN21U65LGqnCrZaI6j3OSvHqFgDV+71rhuo5L7jJthnD0IN0qMa+QpFb0qHVwb5zkKqsE2aNrrpZk1a2S94hBVwgQ2JSAgndT0trZlsDXJqmP90c+Xpjku5PUA2MjHJ+a5N3NidwmyR81xKzVMmqViFGOV06vr5p/+vokFy95d/imSX4wyTeN0qEN5FHTVD6wgXY0QYAAgY8LKHi9GPZRoO4e1R3Rmhs40vHWJD+U5GkDT6moHbp+rBHtt5N8TWO8o1CfnqQ8Hbsl4D1nt8ZLtgT2RsAPn70ZSh2ZtiStea2jHHee1q4dJZ8z5VG/HLynOdFN3MmrwvcPp13umtMXrlHgPkl+uTGeUAQIEFhKQMG7FJeTBxS4fJLfHGA70iq6LkjyTwManZRSzdOt+bpdx3lbmJ5xzSRvSFJzZR3jCdTc5Z+fYaWP8XoqIwIEhhRQ8A45LJJaQOCGSf5igfPmOuVxSR6YpHYa29WjNnr4u8bkfynJtzbGWyVUFbxvH3A6yyp92ddrHpHk4UlqVQwHAQIENiKg4N0Is0YaBe6V5ImN8RYNVVvr1gNw+/Im/fIkX7ho5xc4b7QtYetnW80f/uoFcnfKdgV+JMl/3aPvre1qap0AgWMFFLxeGLsicP4W5sPWmqy1NNg+HZ+RpNbx7TrqgbQqLEc+NrWO78gGu5JbbZZSv1jW9BQHAQIE2gQUvG2UAs0gUHcNa0WDOZ7yP126NSd4X+7iXraPz2q0rDved5hhzOcOWeP70CQ/kOTT5m5M/LUF6jVWrzUHAQIE1hJQ8K7F5+KZBKrQvTBJLfi/iWMbD1ltol9HbXTf4awHxN62yQ7M2Fb9DKx1cH98xjaE7hGonwdP9+BbD6YoBA5NQMF7aCM+dn9raawnNd6FPFNva25n7WK270ftDlbLg3Uc35fkpzsCDR7jBkmel+Q6g+d5yOm9KEktdfaaQ0bQdwIEFhdQ8C5u5cz5BKqw+Pv5wn888nOm5bfeu4G2tt1E945kZ+34ihTrjkfNff76JGcn+f51g+3I9Y9M8pRpg48qLG838C+J35bkV5J8cEdspUmAwIYFFLwbBtfcpQQ+N8nrNmBSH+m/bAPtjNBELcv1/sZEbpXk+Y3xDiXUNabi+JOT1BSd+oXhcklq2+aj42PTfPGLpqXUdsHmyUnuNniij55WfajdFh0ECBD4FwEFrxfCNgTOmQrQeoBoruPFSb6yufibK9euuHedNuHoiufnQ5fk7sepedt/neQqO9aVmrb0kCS1+oODAIEDFvCGdsCDv6Wu1/ai3zxj27XxQW2AcEhHzdGtubpdR02HeGlXMHF2WuCKSV6b5Ho73YtPJP+wJI9P4u7vngyobhBYVEDBu6iU8zoEame02iFtjqPekA/xTawe3Okq8H8tyT3nGBwx2wXqZ/ejknz3kpH/c5L6qukUZzpqasybk1x9yfiXPb2mcNSc+brLOtoDj69Kcu8Dmu605lC6nMBuCyh4d3v8din7emP+780J11zVWku1c85qc4qzhauPmP+xMfo+LTXWyDJkqPrlbp2NGWo95judsrxXzS2ulSmqIL1zY49vkeTPjon3JUle0NhOV6gqfmuVmA90BRSHAIFxBBS844zFPmdSb6idmznUtIj7NcfcFf96COo3klzQlPCPJfmPTbGEmV+gHiKsJdNGPx6Q5LELJnmTJK9c8NxNnVbLnt03yas31aB2CBCYV0DBO6+v6JcI3CvJExsw6uP2+tj9UI/bJvn9xs7X6gEfaYwn1LwC5+7Ix++1NXDdRV7l6N4kZZUcjrumPqH6+QP9NKnLUBwCWxVQ8G6V/2AaP2m+4EkQtfrAU086aY//vTbkeE9j/x6c5Oca4wk1v0DNpX3H/M2s3cLnJPnbtaNcEqAemKvXaT2IOtrx35L86DQ/ebTc5EOAwDECCl4vi00IrFrwfvmOfHw7p+FPJakdzroO3/NdkpuNs+r30CaznPsTg1smqakGIx61BOJzR0xMTgQIXCLgzc8rYRMCy75Z1wM0f7OJxAZuo/uu7ucnqafSHbsncOMkFw+cdj3o9vQN51dreNf0phE3wbhHkgs37KE5AgROEFDweolsQuBtSWrnqUWPWlf2kJ+UrmXGarmxjqMeHKoHiBy7K7DsL4yb6umHpmkHI8wDv0OSJySpLaBHOf48yRcd6MO1o4yBPAh8XEDB68WwCYHzV7gDVHdwOld22EQ/122j+65ubd38+nWTcv3WBUYseGtZs2dsXeb4BK42bS4x0t3fWyf540G9pEXgIAQUvAcxzEN0cpU37etOi98P0YGZk6jNAH6kqY16ovxnmmIJs12B2rjh3dtN4VKt/2CSRwyUzyKpfGOSX13kxA2co/DdALImCBwnoOD1utiUwB8mqR/2yx61vFEtc7SvR62r2/WRcFnVfMquePtqvkv9qo1V3j5AwucNulnEsjR197eK9vra5vEFA649vE0PbROYXUDBOzuxBk4RWOUu79Hl12reWWyEgfnxJD/UlMjpdrVqCi/MFgXW+b5ZNe16IOxhSf5y1QA7cF39snnHJN+T5N9sKd+zktRcaAcBAjMLKHhnBhb+UgK1zNi6S/dcP8kbd9y1pmq8qakPtTbrMg8ENjUrzAYF5ip4nzPNw62l7xRdl2xT/pDGqUWLvkT+Q5KfWPRk5xEgsJqAgnc1N1etLvALSe6/+uX/cuU/Jak7vrv4Jv0/k3zHmv0/uvzLklzUFEuYcQXq4cPXNaVXc8V/Osk7m+Lta5h6b7x9kt/ZUAf/IckNk/zzhtrTDIGDE1DwHtyQD9Hh5yf50qZMrtd4t7QppWPD3DTJS5sa+GiSyzXFEmY3BL49SS0xt8px32lrb3O7V9H7xDX3npY+Wy/Kma+uZcxeMmcDYhM4VAEF76GO/Pb7vepDbKfL/Nwkte7laEdtj/rexqTuOS243xhSqB0RuGqS30xy2xPyfUWSuvv/rh3p1y6mWatn/EWSz5wh+V35JX6GrgtJYD4BBe98tiKfLPCYJA86+bSlznhakm9I8v6lrprn5O47QnVXt+7uOgiUwJWT/OvpFz2vi+29JmpL5Tcn+fTGFLw3N2IKRaAEfFN5HWxboObz1rzeuY4HJ/lfG16q6yrNc/EumO7szWUkLgECPQI1P7/m6a971KoRm5o/vG6uriewEwIK3p0Ypr1PslZe+LsN9vLp03Jgr0nyweZ2z07y2saYV5ghx8b0hCJA4BiBdX8OvGe6gw+XAIEmAQVvE6QwLQI/nOS/tERaL0jNk3xmkv+7xJ3aqyepJcK6Dnd1uyTFIbA9gdpgYtVnC7w/b2/ctLyHAr6h9nBQd7xLNU+15uHWgvAjHm+Ztimtu8SvTHLzJL/VnOjlk3y4OaZwBAhsR+BKSR6+wiYz3p+3M15a3VMB31B7OrB70K16GGefd3k6bog+I8lb92DsdIHArgjUags3SVJ3YmtFlTrqzy+elk6sNZC3dXh/3pa8dvdSwDfUXg7rXnXqbkmevFc9+v8786okd5k2F/C0/Z4Ptu4tLFC/AN4mya2S1JJstRVwfX/Un+cnufbCkXbvxEcl+d7dS1vGBMYVUPCOOzYyu7RArbbws1CWEvirJM9K8oZplYraeKAKhvqztqutnerq7zV9on4W1Ff9v1rSrZZZutgd56W8Rzq5xrK2sP78JFU41lHLZ9VXjX19VeFY02fqz6Pxr/Pq718xfdWasI7NC/i0Z/PmWtxzAQXvng/wHnavPmp84R72S5cWE/jbJM+eNlWoQq3mfNdXFXJVzNfPtCri6s+joq7+rYr6o3PrvPq3+u+jXwKO/n50Xn3EfcvFUnIWgVaB2mZ4n+9et2IJRmBRAQXvolLOG03gGkneNlpS8iFAgMCaAvULmm2g10R0OYHLCih4vSb2QeDuSS7ch47oAwECBy1wsyQvO2gBnScwk4CCdyZYYbcm8FVJ/mhrrWuYAAECqwmck+TVq13qKgIEThJQ8J4k5N/3QaAe3Pl3SR64D53RBwIE9k6gtiN/9971SocIDCSg4B1oMKSyFYEbJrlmkpoWcftpI4mtJKJRAgQOTuB+SR5/cL3WYQJbEFDwbgFdkzslcONpWae6S1y7JVmmaaeGT7IEhhOobcvv46Hb4cZFQnsuoODd8wHWvdkFbpTkWtPd4Qck+czZW9QAAQKbEnhfkhdNS929PckLpv+u///OaRpCrapg7u2mRkQ7BFYUUPCuCOcyAgsK1JqwtXZwbV968yS1gYaDAIH5BJ47rdX8iqkorZZqma9a/aCKVAcBAgcooOA9wEHX5aEFrjhtpVo7LX1w2lL1vCRff8qOWUN3QHIHL1BF5W8lefm0Y1/dGa33mitMO/nV32ujjzrekeR5ST5w8GoACBCYVUDBOyuv4AT2XqAKl9qVrHYoq7toVbDXDmh11Me+V5r+ux4MPCvJ2UnOnb6uOhVB9ZHw0W5pR3/WnfGjomjXEMuitmh+XZI/SXJRkvcm+fvp/9dOb/XLzNHOb+V2tDNcmZVTHVUw2oBg10ZfvgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgCG/vfQAAAQISURBVAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXgIK3S1IcAgQIECBAgACBIQUUvEMOi6QIECBAgAABAgS6BBS8XZLiECBAgAABAgQIDCmg4B1yWCRFgAABAgQIECDQJaDg7ZIUhwABAgQIECBAYEgBBe+QwyIpAgQIECBAgACBLgEFb5ekOAQIECBAgAABAkMKKHiHHBZJESBAgAABAgQIdAkoeLskxSFAgAABAgQIEBhSQME75LBIigABAgQIECBAoEtAwdslKQ4BAgQIECBAgMCQAgreIYdFUgQIECBAgAABAl0CCt4uSXEIECBAgAABAgSGFFDwDjkskiJAgAABAgQIEOgSUPB2SYpDgAABAgQIECAwpICCd8hhkRQBAgQIECBAgECXwP8DZlOCS4oCy0QAAAAASUVORK5CYII=';
}
