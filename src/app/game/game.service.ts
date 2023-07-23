import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';
import { Router } from '@angular/router';
import { Move } from '../board/board.component';

export type Game = {
  id?: string,
  date?: Date,
  FEN: string,
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
      }).catch((error: Response) => {
        if (error.status === 401) {
          this.router.navigate(['login'])
        } else if (error.status === 404) {
          this.router.navigate(['notfound'])
        } else {
          error.json().then(e => console.error(e))
        }
      })
  }
  
  getGame(id: string): Promise<Game> {
    
    return fetch(`${environment.baseUrl}/${ApiPaths.Games}/${id}`, {credentials: 'include'})
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        return body.game
      }).catch((error: Response) => {
        if(error.status === 401){
          console.error("Unauthorized")
          this.router.navigate(['login'])
        } else if (error.status === 404) {
          console.error("Game not found")
          this.router.navigate(['notfound'])
        } else {
          error.json().then((e: any) => console.error("Error getting Game", e.msg))
        }
      })
  }

  createGame(game: Game) {

    fetch(`${environment.baseUrl}/${ApiPaths.Games}/new`, 
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
        this.router.navigate(['play', {id: body.gameId}])
      }).catch ((error: Response) => {
        if (error.status === 401) {
          this.router.navigate(['login'])
        } else if (error.status === 404) {
          this.router.navigate(['notfound'])
        } else {
          error.json().then(e => console.error(e))
        }
      })
  }

  getValidMoves(gameId: string, playerColor: string) {
    return fetch(`${environment.baseUrl}/${ApiPaths.Games}/${gameId}/validMoves?` + new URLSearchParams({playerColor: playerColor}), { credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        return body.validMoves
      }).catch((error: Response) => {
        if (error.status === 401) {
          this.router.navigate(['login'])
        } else if (error.status === 404) {
          this.router.navigate(['notfound'])
        } else {
          error.json().then(e => console.error(e))
        }
      })
  }

  doMove(move: Move, gameId: string) {
    return fetch(`${environment.baseUrl}/${ApiPaths.Games}/${gameId}/move`, 
      {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
        body: JSON.stringify(move)
      }).then(response => {
        if (!response.ok) {          
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {        
        console.log(body);
      }).catch((error: Response) => {        
        if (error.status === 401) {
          this.router.navigate(['login'])
        } else if (error.status === 404) {
          this.router.navigate(['notfound'])
        } else {
          error.json().then(e => console.error(e))
        }
      })
  }
  
}
