import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';

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

  constructor() { }

  pastGames: Game[] = [];

  currentGames: Game[] = [];

  getGames(): Promise<void> {
    return fetch(`${environment.baseUrl}/${ApiPaths.Games}`, {credentials: 'include'})
      .then(response => response.json())
      .then(body => {
        console.log(body);
        this.pastGames = body.games
          .filter((game: Game) => game.ended)
        this.currentGames = body.games
          .filter((game: Game) => !game.ended)
      });
  }

  async getGame(id: string): Promise<Game | undefined> {
    if (this.pastGames.length === 0 && this.currentGames.length === 0){
      await this.getGames()
    }
    return this.pastGames.find(g => g.id === id) || this.currentGames.find(g => g.id === id)
  }
}
