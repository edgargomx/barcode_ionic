import { Component, ViewChild, Renderer } from '@angular/core';
import { NavController,NavParams, Platform, Content, normalizeURL, ViewController, ToastController  } from 'ionic-angular';
import { BarcodeScanner ,BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { File, IWriteOptions } from '@ionic-native/file';
import { Storage } from '@ionic/storage';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { ModalController } from 'ionic-angular';


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
    <ion-content>
      <ion-list>
          <ion-item>
            <ion-avatar item-start>
              <!--img src="{{character.image}}"-->
            </ion-avatar>
            
            <div *ngIf="userInfo != undefined">
                <p>No. Evento :</p> {{ userInfo.evento }} 
                <p>Nombre : </p> {{ userInfo.nombre }} 
                <p>No. Corredor : </p> {{ userInfo.numero }} 
                <p>Distancia : </p> {{ userInfo.distancia }} 
                <p>Categoria : </p> {{ userInfo.categoria }}  
                <p>Tipo Código : </p> {{ userInfo.codigo }} 
                <p>Estatus Pago : </p>{{ userInfo.status }} 
                <p>Descrip. Pago :</p>
                <ul>
                  <li *ngFor="let p of productos">{{ p }}</li>
                </ul>                      
                <!--p>Lista Compra : {{ userInfo.codigo }} </p-->                     
                <!--p>Lista Asientos Trasporte : {{ userInfo.numero }} </p-->
                
            </div>
          </ion-item>
          <button ion-button round (click)="dismiss()">Cerrar</button>
      </ion-list>
    </ion-content>`
    })
export class Profile {
  userInfo;
  productos = [];
 constructor(params: NavParams,public platform: Platform, public viewCtrl: ViewController) {
   this.userInfo = JSON.parse(params.get('user'));
   console.log(this.userInfo);
   if (this.userInfo.descr !== null) {
    this.productos = this.userInfo.descr.replace('Inscripción,','').replace(',Cargo por servicio','').split(',');
   }
   
   console.log(this.productos);
   console.log('User', this.userInfo);
 }
 dismiss() {
  this.viewCtrl.dismiss();
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
        prompt : "Scan your barcode "
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
    this.getInfoRunner();
  }

  getInfoRunner(){
    console.log(this.param);
    this.userService.getInfoRunner(this.param).subscribe(
      (response) => {
        const res = JSON.parse(response['_body']);
        console.log(res);
        if (res.error === 0){
          this.userInfo = res.msg;
          this.presentModal(this.userInfo);
        }else{
          console.log(res);
          this.presentToast(res.msg)
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

  ionViewDidEnter() {
    // https://github.com/ionic-team/ionic/issues/9071#issuecomment-362920591
    // Get the height of the fixed item
   /* let itemHeight = this.fixedContainer.nativeElement.offsetHeight;
    let scroll = this.content.getScrollElement();
 
    // Add preexisting scroll margin to fixed container size
    itemHeight = Number.parseFloat(scroll.style.marginTop.replace("px", "")) + itemHeight;
    scroll.style.marginTop = itemHeight + 'px';*/
  }
 
  ionViewDidLoad() {
    /* Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
*/
  //  console.log(this.content._scrollContent);
   // this.content._scrollContent.nativeElement.style.marginTop = "35px";
 
  }

  selectColor(color) {
    this.selectedColor = color;
  }
   
  startDrawing(ev) {
    var canvasPosition = this.canvasElement.getBoundingClientRect();
   
    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }
   
  moved(ev) {
    var canvasPosition = this.canvasElement.getBoundingClientRect();
   
    let ctx = this.canvasElement.getContext('2d');
    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;
   
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = 5;
   
    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();
   
    ctx.stroke();
   
    this.saveX = currentX;
    this.saveY = currentY;
  }
   
   
  saveCanvasImage() {
    var dataUrl = this.canvasElement.toDataURL();
   
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
   
    let name = new Date().getTime() + '.png';
    let path = this.file.dataDirectory;
    let options: IWriteOptions = { replace: true };
   
    var data = dataUrl.split(',')[1];
    let blob = this.b64toBlob(data, 'image/png');
   
    this.file.writeFile(path, name, blob, options).then(res => {
      this.storeImage(name);
    }, err => {
      console.log('error: ', err);
    });
  }

  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
   
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
   
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
   
      var byteArray = new Uint8Array(byteNumbers);
   
      byteArrays.push(byteArray);
    }
   
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  storeImage(imageName) {
    let saveObj = { img: imageName };
    this.storedImages.push(saveObj);
    this.storage.set(STORAGE_KEY, this.storedImages).then(() => {
      setTimeout(() =>  {
        this.content.scrollToBottom();
      }, 500);
    });
  }
   
  removeImageAtIndex(index) {
    let removed = this.storedImages.splice(index, 1);
    this.file.removeFile(this.file.dataDirectory, removed[0].img).then(res => {
    }, err => {
      console.log('remove err; ' ,err);
    });
    this.storage.set(STORAGE_KEY, this.storedImages);
  }
   
  getImagePath(imageName) {
    let path = this.file.dataDirectory + imageName;
    // https://ionicframework.com/docs/wkwebview/#my-local-resources-do-not-load
    path = normalizeURL(path);
    return path;
  }
}
