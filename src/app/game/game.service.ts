import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';
import { Router } from '@angular/router';

export type Game = {
  id?: string,
  date?: Date,
  fen: string,
  moves: string,
  moveTimes: string,
  timeControl: string,
  result: string,
  whitePlayerId?: string,
  blackPlayerId?: string,
  whitePlayerUsername: string,
  blackPlayerUsername: string
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private router: Router) { }

  pastGames: Game[] = [];

  currentGames: Game[] = [];

  getGames(): Promise<Game[]> {
    return fetch(`${environment.baseUrl}/${ApiPaths.Games}`, {credentials: 'include'})
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        this.pastGames = body.games.filter((game: Game) => game.result !== "*").toSorted((g: Game) => g.date).toReversed()
        this.currentGames = body.games.filter((game: Game) => game.result === "*").toSorted((g: Game) => g.date).toReversed()
        return body.games
      }).catch(error => {
        if(error.status === 401) {
          this.router.navigate(['login'])
        } else {
          error.json().then((e: any) => console.error(e));
        }
      })
  }

  createGame(game: Game) {
    fetch(`${environment.baseUrl}/${ApiPaths.Game}/new`, 
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
        body: JSON.stringify(game)
      }).then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        console.log("SUCCESS: Game Created", body)
        this.router.navigate(['play', {id: body.gameId}])
      }).catch (error => {
        console.log("ERROR: Failed to Create Game");
        error.json().then((e: any) => console.log(e))
      })
  }

  async getGame(id: string): Promise<Game | undefined> {
    
    let result: Game | undefined;

    if (this.currentGames && this.currentGames.some((g: Game) => g.id === id)){
      result = this.currentGames.find((g: Game) => g.id === id)!
    }else if (this.pastGames && this.pastGames.some((g: Game) => g.id === id)){
      result = this.pastGames.find((g: Game) => g.id === id)!
    } else {
      result = (await this.getGames()).find((g: Game) => g.id === id)
    }

    return result
  }
}
