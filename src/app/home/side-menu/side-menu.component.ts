import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ApiPaths } from 'src/app/api-paths';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
  animations: [
    trigger('openClose', [
      state('left', style({ transform: 'translateX(-100%)' })),
      state('right', style({ transform: 'translateX(0%)' })),
      transition('left => right', [
        animate(125, style({ transform: 'translateX(0%)' })),
      ]),
      transition('right => left', [
        animate(125, style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ]
})
export class SideMenuComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.updateProfile()
  }

  @Input()
  isOpen: boolean = false;

  numFriends: number = 0;

  username: string = "";

  email: string = "";

  newPassword: string = "";

  confirmNewPassword: string = "";

  friendUsername: string = "";

  editingEmail: boolean = false;
  
  editingPassword: boolean = false;

  print(msg: string){
    console.log(msg)
  }

  async getProfile(): Promise<{friends: number, username: string, email: string} | null> {
    const response = await fetch(`${environment.baseUrl}/${ApiPaths.Profile}`, {credentials: 'include'})
    if(response.status === 200) {
      return response.json();
    }else{
      console.log(response.json());
      return null;
    }
  }

  async updateProfile(): Promise<void> {
    const profile = await this.getProfile()
    this.numFriends = profile?.friends || 0
    this.username = profile?.username || ""
    this.email = profile?.email || ""
  }

  addFriend(): void{
    fetch(`${environment.baseUrl}/${ApiPaths.Friends}`, 
      {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({username: this.friendUsername}),
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
      }
    ).then(response => response.json()
    ).then(body => {
      console.log(body);
      if(body.status === 200){
        this.numFriends = body.friends;
        return body;
        // add success message?
      }else{
        // console.log(body);
        // add error message
      }
    }) 
  }

  changeEmail(): void {
    this.editingEmail = !this.editingEmail;
  }

  saveEmail(): void {
    this.saveProfile({email: this.email})
  }

  changePassword(): void {
    this.editingPassword = !this.editingPassword;
  }

  savePassword(): void {
    this.saveProfile({password: this.newPassword, confirm: this.confirmNewPassword})
  }

  saveProfile(credentials: {email?: string, password?: string, confirm?: string}): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Profile}`,
      {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(credentials),
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
      })
    .then(Response => Response.json())
    .then(body => {
      console.log(body);
      this.editingEmail = false;
      this.editingPassword = false;
      if(body.status === 200) {
        // add success message
        return body
      }else{
        // add error message
      }
    })
  }
}
