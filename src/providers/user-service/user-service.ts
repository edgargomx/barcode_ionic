import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from '../../../node_modules/rxjs/Observable';

/*
  Generated class for the UserServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserServiceProvider {

  constructor(public http: HttpClient) {
    console.log('Hello UserServiceProvider Provider');
  }

  getUsers() {
    //https://retodealtura.mx/app_api.php
    return this.http.get('https://randomuser.me/api/?results=25');
  }

  getInfoRunner(dataRunner: string) {
    return this.http.get(`https://retodealtura.mx/app_api.php?qr=${ dataRunner }`);
  }

}