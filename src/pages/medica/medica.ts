import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user-service/user-service';

/**
 * Generated class for the MedicaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-medica',
  templateUrl: 'medica.html',
})
export class MedicaPage {
  infoAsistencia = {
     id: 0,
     paramedico: '',
     km: '',
     descripcion: ''
   };
  userInfo;
  arrayAsistencias = [];
  loader;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public userService: UserServiceProvider,
              public loadingCtrl: LoadingController,
              private toastCtrl: ToastController) {
    this.userInfo = navParams.data;
    console.log("medica", this.userInfo);
    this.infoAsistencia.id = parseInt(this.userInfo.inscripcion, 10);
    this.getInfoAsistencias(this.infoAsistencia.id);
    this.loader = this.loadingCtrl.create({
      content: "Guardando...",
      spinner: "bubbles"
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MedicaPage');
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

  validDatos(){
    if(this.infoAsistencia.paramedico != ''){
      if(this.infoAsistencia.descripcion != '' && this.infoAsistencia.descripcion != null && this.infoAsistencia.descripcion  != undefined){
        if(this.infoAsistencia.km != '' && this.infoAsistencia.km != null && this.infoAsistencia.km  != undefined){
          console.log("datos validos");
          console.log(this.infoAsistencia);
          this.setInfoEntrega();
        }else{
          this.presentToast('Falta ingresar un kilometro');
        }
      }else{
        this.presentToast('Falta ingresar una descripción');
      }
    }else {
      this.presentToast('Falta ingresar nombre completo de paramedíco');
    }
  }

  setInfoEntrega(){
    this.loader.present();
    this.userService.setKitEntregado(this.infoAsistencia).subscribe(res => {
      console.log(res);
      if (res['error'] === 0) {
        this.loader.dismiss();
        this.arrayAsistencias = res['msg'];
        this.infoAsistencia.paramedico ='';
        this.infoAsistencia.km = '';
        this.infoAsistencia.descripcion = '';
      }else {
        console.log(res);
        this.loader.dismiss();
          this.presentToast(res['msg'])
      }
    });
  }

  getInfoAsistencias(id_inscripcion){
    this.userService.getInfoRunnerAsistenciaMedica(id_inscripcion).subscribe(
      (response)=> {
        console.log(response);
        if(response['error'] == 0){
          this.arrayAsistencias = response['msg'];
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
