import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../../api-paths';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Creates a new Auth Service instance 
   * @param router the router to user for navigation
   */
  constructor(private router: Router) { }

  /**
   * attempts to log in to the app with the given credentials
   * @param formData the username or email and password to use to log in
   */
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
      
      if(response.status === 200){
        this.router.navigate(['home'])
      } else {
        // TODO show some 'Invalid Credentials' message
        console.error(response.body);
        console.error(await response.json());
      }
    } catch(e) {
      console.error(e);
    }
  }

  /**
   * attemps to register a new user of the app using the given credentials
   * @param formData the email, password, and password confirmation to use to register
   */
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
        // TODO show some message to the user
        console.error(response.body);
        console.error(await response.json());
      }
    } catch(e) {
      console.error(e);
    }
  }

  /**
   * logs the current user out of the app
   */
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
        error.json().then((e: any) => console.error(e))
      })
  }
}
