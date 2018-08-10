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

@Injectable()
export class UserServiceProvider {

  constructor(public http: Http) {
    console.log('Hello UserServiceProvider Provider');
  }

  getInfoRunner(dataRunner: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Authorization': api_key })
    };
    let headers = new Headers();
    headers.append('Authorization', api_key);
    return this.http.get(`https://retodealtura.mx/app_api.php?qr=${ dataRunner }`, {headers: headers});
  }

  getInfoRunnerCode(dataRunner: string) {
    return this.http.get(`https://retodealtura.mx/app_api.php?code=${ dataRunner }`);
  }

}