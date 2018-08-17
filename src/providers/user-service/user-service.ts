import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Http, Headers, Response} from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from '../../../node_modules/rxjs/Observable';

/*
  Generated class for the UserServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
const api_key = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJNb2JpbGVBcHAiLCJlbnQiOiJSZXRvRGVBbHR1cmEifQ.ez01RSCjLqDhDh2uzA7mW1XpmIneNxdtFQXYX8Cjdyc';
const httpOptions = {
  headers: new HttpHeaders().set( 'Authorization', api_key ).set('Content-Type' , 'application/json')
};
@Injectable()
export class UserServiceProvider {

  constructor(public http: HttpClient) {
    console.log('Hello UserServiceProvider Provider');
  }

  getInfoRunner(dataRunner: string) {
    
    let headers = new Headers();
    headers.append('Authorization', api_key);
    return this.http.get(`https://retodealtura.mx/app_api.php?qr=${ dataRunner }`, httpOptions);
  }

  getInfoRunnerCode(dataRunner: string) {
    return this.http.get(`https://retodealtura.mx/app_api.php?code=${ dataRunner }`);
  }

  setKitEntregado(data_runner) {
    return this.http.post('https://retodealtura.mx/app_api.php', JSON.stringify(data_runner), httpOptions );
  }
}