import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor() {
    this.updateProfile()
  }

  numFriends: number = 0

  username: string = ""

  email: string = ""

  getUsername(){
    return this.username;
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
}
