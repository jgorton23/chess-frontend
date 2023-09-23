import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../../api-paths';
import { Router } from '@angular/router';
import { Move } from '../../board/board.component';

export type Game = {
  id?: string,
  date: Date,
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

  currentGame?: Game;

  //#region API

  getGames(): Promise<Game[]> {
    
    return fetch(`${environment.baseUrl}/${ApiPaths.Games}`, {credentials: 'include'})
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        this.pastGames = body.games.filter((game: Game) => game.result !== "*")
        this.pastGames.forEach(game => game.date = new Date(game.date))
        this.pastGames.sort((a,b) => {return (a.date.getTime() > b.date.getTime()) ? -1 : 1})
        this.currentGames = body.games.filter((game: Game) => game.result === "*")
        this.currentGames.forEach(game => game.date = new Date(game.date))
        this.currentGames.sort((a,b) => {return (a.date.getTime() > b.date.getTime()) ? -1 : 1})
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

  createGame(game: Game): Promise<void> {

    return fetch(`${environment.baseUrl}/${ApiPaths.Games}/new`, 
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
        console.log(body);
          
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

  resign() {
    let gameId = this.currentGame?.id
    if (gameId) {
      fetch(`${environment.baseUrl}/${ApiPaths.Games}/${gameId}/resign`,
        {
          credentials: 'include',
          method: 'PUT',
          headers: {
            'Accept': "application/json, text/plain, */*",
            'Content-Type': "application/json;charset=utf-8"
          }
        }).then(response => {
          if (!response.ok) {
            return Promise.reject(response)
          } else {
            return response.json()
          }
        }).then(body => {
          console.log(body)
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
  
  //#endregion

  //#region logic

  isInCheck(playerColor: string): boolean {
    let moveIsCheck = (this.currentGame?.moves.split(" ").at(-1) ?? "").includes("+")
    let moveIsMate = (this.currentGame?.moves.split(" ").at(-1) ?? "").includes("#")
    let moveCount = (this.currentGame?.moves.split(" ") ?? []).length
    return (moveIsCheck && playerColor === (moveCount % 3 === 2 ? 'b' : 'w')) || (moveIsMate && playerColor === (moveCount % 3 === 2 ? 'b' : 'w'))
  }

  isInLastMove(coordinate: string): boolean {
    return (this.currentGame?.moves.split(" ").at(-1) ?? "").includes(coordinate)
  }

  //#endregion

}
