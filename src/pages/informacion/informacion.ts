import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Nav } from 'ionic-angular';
import { TabsPage } from '../index.paginas';


export interface PageInterface {
  title: string;
  pageName: string;
  tabComponent?: any;
  index?: number;
  icon: string;
}

@IonicPage()
@Component({
  selector: 'page-informacion',
  templateUrl: 'informacion.html',
})
export class InformacionPage {

  // Basic root for our content view
    rootPage = 'TabsPage';

    // Reference to the app's root nav
    @ViewChild(Nav) nav: Nav;

    pages: PageInterface[] = [
      { title: 'Corredor', pageName: 'TabsPage', tabComponent: 'PrincipalPage', index: 0, icon: 'list' },
      { title: 'Productos', pageName: 'TabsPage', tabComponent: 'ProductosPage', index: 1, icon: 'shirt' },
      { title: 'Asistencia Medica', pageName: 'TabsPage', tabComponent: 'MedicaPage', index: 0, icon: 'heart' },
    ];
  userInfo: any;
  // tabs
  tab0Root = 'PrincipalPage';
  tab1Root = 'ProductosPage';
  tab2Root = 'MedicaPage';
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController) {
    this.userInfo = navParams.data;
    //console.log(this.userInfo);
  }
  segmentChanged(event) {

    //this.visible=true;
    //this.selectedTitle = event;
  //  console.log(event);
    //this.content.scrollToTop();
    let loader = this.loadingCtrl.create({
      content: "Cargando...",
      spinner: "bubbles"
    });
    loader.present();
    //this.dataservice.sortArray(this.selectedTitle, this.bitcoinData).then((data)=>{
      loader.dismiss();
    //});

    }

  close(){
    this.navCtrl.pop();
  }

  openPage(page: PageInterface) {
    let params = {};

    // The index is equal to the order of our tabs inside tabs.ts
    if (page.index) {
      params = { tabIndex: page.index };
    }

    // The active child nav is our Tabs Navigation
    if (this.nav.getActiveChildNav() && page.index != undefined) {
      this.nav.getActiveChildNav().select(page.index);
    } else {
      // Tabs are not active, so reset the root page
      // In this case: moving to or from SpecialPage
      this.nav.setRoot(page.pageName, params);
    }
  }

  isActive(page: PageInterface) {
    // Again the Tabs Navigation
    let childNav = this.nav.getActiveChildNav();

    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'primary';
      }
      return;
    }

    // Fallback needed when there is no active childnav (tabs not active)
    if (this.nav.getActive() && this.nav.getActive().name === page.pageName) {
      return 'primary';
    }
    return;
  }

}
