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

  /**
   * Create a new Profile Service instance
   * @param router the router to use for navigation
   */
  constructor(private router: Router) {
    this.getProfile()
  }

  /**
   * the number of confirmed friends the current user has
   */
  numFriends: number = 0

  /**
   * the username of the current user
   */
  username: string = ""

  /**
   * the email of the current user
   */
  email: string = ""

  /**
   * the confirmed/pending friend list of the current user
   */
  friends: friend[] = []

  /**
   * the users who have sent the current user unresolved friend invitations
   */
  invitations: friend[] = []

  /**
   * Gets the username of the current user, locally if it is already stored, else via the API
   * @returns A promise of the username
   */
  getUsername(): Promise<string> {
    return this.getProfile().then(() => this.username)
  }
  
  /**
   * Updates the profile of the current user with the latest values received via the API
   */
  getProfile(): Promise<void> {
    return fetch(`${environment.baseUrl}/${ApiPaths.Profile}`, {credentials: 'include'})
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

  /**
   * Persists the latest credentials provided by the current user in the database, via the API
   * @param credentials 
   */
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

  /**
   * Adds or Confirms the given user as a friend of the current user
   * @param username the username of the user to add as a friend of the current user
   */
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

  /**
   * Removes the given user as a friend of the current user
   * @param username the username of the user to remove as a friend
   */
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

  /**
   * Updates the friend list of the current user with the latest results provided by the API
   */
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
