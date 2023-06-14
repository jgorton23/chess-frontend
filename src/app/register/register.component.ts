import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  async register(formData: {email: String, password: String, confirm: String}) {
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
}
