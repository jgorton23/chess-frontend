import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';
import { Router } from '@angular/router';

export type friend = {
  username: string,
  pending?: boolean,
  invitation?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private router: Router) {
    this.getProfile()
  }

  numFriends: number = 0

  username: string = ""

  email: string = ""

  friends: friend[] = []

  invitations: friend[] = []

  async getUsername(): Promise<string> {
    if (!this.username){
      await this.getProfile()
    }
    return this.username;
  }
  
  getProfile(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Profile}`, {credentials: 'include'})
      .then(response => {
        if (response.status === 401) {
          return Promise.reject(response)
        } else{
          return response.json()
        }
      })
      .then(profile => {
        this.numFriends = profile?.friends || 0
        this.username = profile?.username || ""
        this.email = profile?.email || ""
      }).catch(error => {
        if (error.status === 401) {
          this.router.navigate(['login'])
        } else {
          error.json().then((e: any) => console.error(e))
        }
      })
  }

  saveProfile(credentials: {username?: string, email?: string, password?: string, confirm?: string}): void {    
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
    .then(response => {
      if (!response.ok) {
        return Promise.reject(response)
      } else {
        return response.json()
      }
    }).then(body => {
      console.log(body);
    }).catch(error => {
      if (error.status === 401) {
        this.router.navigate(['login'])
      } else {
        error.json().then((e: any) => console.error(e))
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
    ).then(response => {
      if (!response.ok) {
        return Promise.reject(response)
      } else {
        return response.json()
      }
    }).then(_ => {
      this.getFriends();
    }).catch(error => {
      if (error.status === 401) {
        this.router.navigate(['login'])
      } else {
        error.json().then((e: any) => console.error(e))
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
    ).then(response => {
      if (response.ok) {
        return Promise.reject(response)
      } else {
        return response.json()
      }
    }).then(_ => {
      this.getFriends();
    }).catch(error => {
      if (error.status === 401) {
        this.router.navigate(['login'])
      } else {
        error.json().then((e: any) => console.error(e))
      }
    })
  }

  getFriends(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Friends}?` + new URLSearchParams({pending: 'true'}), { credentials: 'include' })
      .then(response => {
        if (!response.ok){
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(resp => { 
        this.invitations = resp.friends
          .filter((f: friend) => f.invitation)
          .map((f: friend) => {return {username: f.username}})
        this.friends = resp.friends
          .filter((f: friend) => !f.invitation)
          .toSorted((a: friend, b: friend) => Number(a.pending) - Number(b.pending))
          .map((f: friend) => {return {username: f.username, pending: f.pending}});
      }).catch(error => {
        if (error.status === 401){
          this.router.navigate(['login'])
        } else {
          error.json().then((e: any) => console.error(e))
        }
      })
  }
}
