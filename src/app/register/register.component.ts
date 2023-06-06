import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  register(formData: {email: String, password: String, passwordConfirm: String}) {
    console.log(formData.email);
    console.log(formData.password);
    console.log(formData.passwordConfirm);
    this.router.navigate(['login'])
  }
}
