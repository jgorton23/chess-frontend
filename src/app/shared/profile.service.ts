import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';

export type friend = {
  username: string,
  pending?: boolean,
  invitation?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor() {
    this.getProfile()
  }

  numFriends: number = 0

  username: string = ""

  email: string = ""

  friends: friend[] = []

  invitations: friend[] = []

  getUsername(){
    return this.username;
  }
  
  getProfile(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Profile}`, {credentials: 'include'})
      .then(body => body.json())
      .then(profile => {
        this.numFriends = profile?.friends || 0
        this.username = profile?.username || ""
        this.email = profile?.email || ""
      })
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
      if(body.status === 200) {
        // add success message
      }else{
        // add error message
      }
    })
  }

  addFriend(username: string): void{
    fetch(`${environment.baseUrl}/${ApiPaths.Friends}`, 
      {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({username: username}),
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
      }
    ).then(response => response.json()
    ).then(body => {
      console.log(body);
      this.getFriends();
      if(body.status === 200){
        this.numFriends = body.friends;
        // add success message?
      }else{
        // add error message
      }
    }) 
  }

  removeFriends(username: string): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Friends}`, 
      {
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify({username: username}),
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
      }
    ).then(response => response.json()
    ).then(body => {
      console.log(body);
      this.getFriends();
      if(body.status === 200){
        this.numFriends = body.friends;
      }else{
        // add error message
      }
    }) 
  }

  getFriends(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Friends}?` + new URLSearchParams({pending: 'true'}), { credentials: 'include' })
      .then(body => body.json())
      .then(resp => { 
        this.invitations = resp.friends.filter((f: friend) => f.invitation).map((f: friend) => {return {username: f.username}})
        this.friends = resp.friends.filter((f: friend) => !f.invitation).toSorted((a: friend, b: friend) => Number(a.pending) - Number(b.pending)).map((f: friend) => {return {username: f.username, pending: f.pending}});
      })
  }
}
