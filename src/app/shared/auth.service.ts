import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  async login(formData: {email: string, password: string}) {
    try {
      const response = await fetch(`${environment.baseUrl}/${ApiPaths.Login}`, {
        method: 'POST',
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
        credentials: "include",
        body: JSON.stringify({username: formData.email.split("@")[0], password: formData.password})
      })
      
      const status = response.status
      if(status === 200){
        this.router.navigate(['home'])
      } else {
        console.log(response.body);
        
        console.log(await response.json());
      }
    } catch(e) {
      console.log(e);
    }
  }

  async register(formData: {email: string, password: string, confirm: string}) {
    try {
      const params = {
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
        method: 'POST',
        body: JSON.stringify({...formData, username:formData.email.split("@")[0]})
      }
      const response = await fetch(`${environment.baseUrl}/${ApiPaths.Register}`, params)
      const status = response.status
      if(status === 200){
        this.router.navigate(['login'])
      } else {
        console.log(response.body);
        
        console.log(await response.json());
      }
    } catch(e) {
      console.log(e);
    }
  }

  logout() {
    fetch(`${environment.baseUrl}/${ApiPaths.Logout}`, {method: 'DELETE', credentials: 'include'})
      .then(response => {
        if (!response.ok){
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(_ => {
        this.router.navigate(['login'])
      }).catch(error => {
        error.json().then((e: any) => console.log(e))
      })
  }
}
