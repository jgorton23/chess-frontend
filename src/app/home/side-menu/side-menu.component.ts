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

  username: String = "";

  email: String = "";

  friendUsername: String = "";

  print(msg: String){
    console.log(msg)
  }

  async getProfile(): Promise<{friends: number, username: String, email: String} | null> {
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
      if(body.status === 200){
        console.log(body);
        this.numFriends = body.friends;
        return body;
        // add success message?
      }else{
        console.log(body);
        // add error message
      }
    })
    
  }
}
