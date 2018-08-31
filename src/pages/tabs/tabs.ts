import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  // tabs
  tab0Root = 'PrincipalPage';
  tab1Root = 'ProductosPage';
  tab2Root = 'MedicaPage';
   myIndex: number;
   userInfo;
  //tab3Root = 'PerfilPage';
  constructor(  public navParams: NavParams) {
  // Set the active tab based on the passed index from menu.ts
    this.myIndex = navParams.data.tabIndex || 0;
    this.userInfo = navParams.data;
  }

}
