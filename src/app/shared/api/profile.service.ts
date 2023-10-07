import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../../api-paths';
import { Router } from '@angular/router';

enum Status {
  ONLINE,
  OFFLINE,
  PLAYING
}

export type friend = {
  username: string,
  pending?: boolean,
  invitation?: boolean,
  status?: Status,
  currentGame?: string
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

  users: string[] = []

  /**
   * Gets the username of the current user, locally if it is already stored, else via the API
   * @returns A promise of the username
   */
  getUsername(): Promise<string> {
    return this.username ? Promise.resolve(this.username) : this.getProfile().then(() => this.username)
  }

  getUsers(): Promise<string[]> {
    if (this.users) {
      console.log(this.users);
    } else {
      console.log("test");
    }
      
    return this.users && this.users.length > 0 ? Promise.resolve(this.users) : this.getAllUsers().then(() => this.users)
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
      .then(body => {  
        if (!body) {
          this.router.navigate(['login'])
        }
        this.numFriends = body.profile.friends
        this.username = body.profile.username
        this.email = body.profile.email
      }).catch(error => {
        if (error instanceof Response) {
          error.json().then((e: any) => console.error(e))
          if (error.status === 401) { this.router.navigate(['login']) }
        } else {
          console.error(error);
        }
      })
  }

  getAllUsers(): Promise<void> {
    return fetch(`${environment.baseUrl}/${ApiPaths.Users}`, {credentials: 'include'})
      .then(response => {
        if (response.status === 401) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        if (!body) {
          this.router.navigate(['login'])
        }
        this.users = body.users
      }).catch(error => {
        if (error instanceof Response) {
          error.json().then((e: any) => console.error(e))
          if (error.status === 401) { this.router.navigate(['login'])}
        } else {
          console.error(error)
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
    }).catch(error => {
      if (error instanceof Response) {
        error.json().then((e: any) => console.error(e))
        if (error.status === 401) { this.router.navigate(['login']) }
      } else {
        console.error(error)
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
      if (error instanceof Response) {
        error.json().then((e: any) => console.error(e))
        if (error.status === 401) { this.router.navigate(['login']) }
      } else {
        console.error(error);
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
      if (error instanceof Response) {
        error.json().then((e: any) => console.error(e))
        if (error.status === 401) { this.router.navigate(['login']) }
      } else {
        console.error(error);
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
      }).then(body => { 
        this.invitations = body.friends
          .filter((f: friend) => f.invitation)
          .map((f: friend) => {return {username: f.username}})
        this.friends = body.friends
          .filter((f: friend) => !f.invitation)
          .toSorted((a: friend, b: friend) => Number(a.pending) - Number(b.pending))
          .map((f: friend) => {return {username: f.username, pending: f.pending}});
      }).catch(error => {
        if (error instanceof Response) {
          error.json().then((e: any) => console.error(e))
          if (error.status === 401){
            this.router.navigate(['login'])
          }
        } else {
          console.error(error);
        }
      })
  }
}
