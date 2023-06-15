import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

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
}
