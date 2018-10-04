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
  urlApi = 'https://retodealtura.mx/app_api-v3.php';
  constructor(public http: HttpClient) {
    console.log('Hello UserServiceProvider Provider');
  }

  // GET
  getInfoRunner(dataRunner: string) {
    let headers = new Headers();
    headers.append('Authorization', api_key);
    return this.http.get(`${ this.urlApi }?qr=${ dataRunner }&op=1`, httpOptions);
  }

  getInfoRunnerAsistenciaMedica(dataRunner: string) {
    return this.http.get(`${ this.urlApi }?id=${ dataRunner }&op=2`, httpOptions);
  }

  postShirtRunner(dataRunner: string) {
    return this.http.get(`${ this.urlApi }?id=${ dataRunner }&op=3`, httpOptions);
  }
  getInfoEvento() {
    return this.http.get(`${ this.urlApi }?id_evento=5&op=4`, httpOptions);
  }

  //POST
  setKitEntregado(data_runner) {
    return this.http.post(this.urlApi+'?op=1', JSON.stringify(data_runner), httpOptions );
  }

  setNewAsistenciaMedica(data_runner) {
    return this.http.post(this.urlApi+'?op=2', JSON.stringify(data_runner), httpOptions );
  }

  setProductoPayed(data_runner) {
    return this.http.post(this.urlApi+'?op=3', JSON.stringify(data_runner), httpOptions );
  }

}
