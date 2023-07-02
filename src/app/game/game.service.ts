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
  whiteUsername: string,
  blackUsername: string,
  started: boolean,
  ended: boolean,
  winner?: string,
  date: Date,
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { }

  pastGames: Game[] = [];

  currentGames: Game[] = [];

  getGames(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Games}`, {credentials: 'include'})
      .then(response => response.json())
      .then(body => {
        this.pastGames = body.games
          .filter((game: Game) => game.ended)
        this.currentGames = body.games
          .filter((game: Game) => !game.ended)
      });
  }

}
