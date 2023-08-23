import { Component } from '@angular/core';
import { AuthService } from '../shared/api/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(public authService: AuthService) { }

}
