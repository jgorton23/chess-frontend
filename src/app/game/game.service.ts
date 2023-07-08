import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';
import { Router } from '@angular/router';

export type Game = {
  id?: string,
  moves: string,
  board: string,
  turn: number,
  whiteTime: number,
  blackTime: number,
  whitePlayerId?: string,
  blackPlayerId?: string,
  whitePlayerUsername: string,
  blackPlayerUsername: string,
  started: boolean,
  ended: boolean,
  winner?: string,
  date?: Date,
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private router: Router) { }

  pastGames: Game[] = [];

  currentGames: Game[] = [];

  getGames(): Promise<void> {
    return fetch(`${environment.baseUrl}/${ApiPaths.Games}`, {credentials: 'include'})
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        this.pastGames = body.games
          .filter((game: Game) => game.ended)

        this.currentGames = body.games
          .filter((game: Game) => !game.ended)
      }).catch(error => {
        if(error.status === 401) {
          this.router.navigate(['login'])
        } else {
          error.json().then((e: any) => console.error(e));
        }
      })
  }

  async getGame(id: string): Promise<Game | undefined> {
    if (this.pastGames.length === 0 && this.currentGames.length === 0){
      await this.getGames()
    }
    return this.pastGames.find(g => g.id === id) || this.currentGames.find(g => g.id === id)
  }
}
