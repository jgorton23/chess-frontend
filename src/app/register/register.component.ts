import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  register(formData: {email: String, password: String, passwordConfirm: String}) {
    console.log(formData.email);
    console.log(formData.password);
    console.log(formData.passwordConfirm);
  }
}
