import { Component, ViewChild, Renderer } from '@angular/core';
import { NavController,NavParams, Platform, Content, normalizeURL, ViewController, ToastController  } from 'ionic-angular';
import { BarcodeScanner ,BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { File, IWriteOptions } from '@ionic-native/file';
import { Storage } from '@ionic/storage';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { ModalController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

const STORAGE_KEY = 'IMAGE_LIST';

@Component({
  template : `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          Descripción
        </ion-title>
        <ion-buttons start>
          <button ion-button (click)="dismiss()">
            <span ion-text color="primary" showWhen="ios">Cancel</span>
            <ion-icon name="md-close" showWhen="android, windows"></ion-icon>
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="centrado">
      <ion-list>
            <ion-item *ngIf="userInfo.kit_entregado !== null" class="text-red-center">
              <p>Kit Entregado : </p>{{ userInfo.kit_entregado }}
            </ion-item>
            <div *ngIf="userInfo != undefined">
              <ion-item>
                <p>No. Evento :</p> {{ userInfo.evento }} 
              </ion-item>
              <ion-item>
                <p>Nombre : </p> {{ userInfo.nombre }} {{ userInfo.paterno }} {{ userInfo.materno }} 
              </ion-item>
              <ion-item>
                <p>No. Corredor : </p> {{ userInfo.numero }} 
              </ion-item>
              <ion-item>
                <p>Distancia : </p> {{ userInfo.distancia }} 
              </ion-item>
              <ion-item>
                <p>Categoria : </p> {{ userInfo.categoria }} ({{ sexo }})
              </ion-item>
              <ion-item>
                <p>Tipo Código : </p> {{ userInfo.codigo }} 
              </ion-item>
              <ion-item>
                <p>Estatus Pago : </p>{{ userInfo.status }} 
              </ion-item>
              <ion-item>
                <p>Productos :</p>
                <ul>
                  <li *ngFor="let p of productos">{{ p }}</li>
                </ul>                      
                <!--p>Lista Compra : {{ userInfo.codigo }} </p-->                     
                <!--p>Lista Asientos Trasporte : {{ userInfo.numero }} </p-->
              </ion-item>
              <ion-item *ngIf="showFirma">
                <signature-pad *ngIf="userInfo.kit_entregado === null" [options]="signaturePadOptions" (onBeginEvent)="drawStart()" (onEndEvent)="drawComplete()"></signature-pad>
                                
                <img *ngIf="userInfo.kit_entregado !== null" style="max-width: 100%; height: auto;" src="{{ imgFirma }}" />
                </ion-item>
              <div *ngIf="showFirma && userInfo.kit_entregado === null">
                <button ion-button round (click)="cleanSingArea()" > Limpiar</button>
                <button ion-button round (click)="saveSing()" > Guardar</button>
              </div>

            </div>
            
            <!--button ion-button round (click)="showAreaSing()" *ngIf="userInfo.kit_entregado === null"> Firmar</button-->
            <button ion-button round (click)="entregarPaquete()" *ngIf="userInfo.kit_entregado === null && !showFirma"> Entregar Kit</button>
          <ion-item *ngIf="userInfo.kit_entregado !== null" class="text-red-center">
              <p>Kit Entregado : </p>{{ userInfo.kit_entregado }}
            </ion-item>        
          <button ion-button round (click)="dismiss()">Cerrar</button>
      </ion-list>
    </ion-content>`
    })
export class Profile{
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

}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  entryComponents:[ Profile ]
})
export class HomePage {
  scanData : {};
  options :BarcodeScannerOptions;
  encodeData : string ;
  encodedData : {} ;

  // Canvas stuff
  @ViewChild('imageCanvas') canvas: any;
  
  canvasElement: any;
 
  saveX: number;
  saveY: number;
 
  storedImages = [];
 
  // Make Canvas sticky at the top stuff
  @ViewChild(Content) content: Content;
  @ViewChild('fixedContainer') fixedContainer: any;
 
  // Color Stuff
  selectedColor = '#9e2956';
 
  colors = [ '#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459cde', '#4250ad', '#802fa3' ];
  
  userInfo;
  param ; // = '023f12b8e1d9987cc9a497bb7beeb93b';
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private barcodeScanner: BarcodeScanner,private qrScanner: QRScanner,
              private file: File, private storage: Storage, 
              public modalCtrl: ModalController,
              public renderer: Renderer, private plt: Platform,
              private toastCtrl: ToastController,
              public userService: UserServiceProvider
            ) {
              // Load all stored images when the app is ready
    this.storage.ready().then(() => {
      this.storage.get(STORAGE_KEY).then(data => {
        if (data != undefined) {
          this.storedImages = data;
        }
      });
    });
    

  }

  scan(){
    this.options = {
        prompt : "Escanear QR del participante"
    }
    this.barcodeScanner.scan(this.options).then((barcodeData) => {
        console.log(barcodeData);
        this.scanData = barcodeData;
        this.param = barcodeData.text;        
        this.getInfoRunner();
    }, (err) => {
        console.log("Error occured : " + err);
    });         
  }  
  
  encodeText(){
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE,this.encodeData).then((encodedData) => {

        console.log(encodedData);
        this.encodedData = encodedData;

    }, (err) => {
        console.log("Error occured : " + err);
    });                 
  }
  
  searchByCode(code) {
    this.param = code;
    if(code === '') {
      this.presentToast('Debes ingresar número de corredor');
    }else {
        this.getInfoRunner();
    }
    
  }

  getInfoRunner(){
    console.log(this.param);
    this.userService.getInfoRunner(this.param).subscribe(
      (response) => {
        const res = response; //JSON.parse(response.toString());
        console.log(res);
        if (res['error'] === 0){
          this.userInfo = res['msg'];
          this.presentModal(this.userInfo);
        }else{
          console.log(res);
          this.presentToast(res['msg'])
        }
        
      },
      (error) => {
        console.error(error);
      }
    );
  }
 
  presentModal(user) {
    const modal = this.modalCtrl.create(Profile, { user: JSON.stringify(user) });
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