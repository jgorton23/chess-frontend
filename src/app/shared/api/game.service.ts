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

  //#region current game info

  currentGame?: Game;

  currentGameStates: (Game | null)[] = []

  selectedMove: number = 0

  currentPlayer: string = 'w'

  playerColor: string = ''

  playerUsername: string = ''

  opponentUsername: string = ''

  currentValidMoves: string[] = []

  //#endregion

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

  getGameStates(id: string): Promise<Game[]> {

    return fetch(`${environment.baseUrl}/${ApiPaths.Games}/${id}/states`, { credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        } else {
          return response.json()
        }
      }).then(body => {
        return body.gameStates
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
    let moveIsCheck = (this.selectedGameState()?.moves.split(" ").at(-1) ?? "").includes("+")
    let moveIsMate = (this.selectedGameState()?.moves.split(" ").at(-1) ?? "").includes("#")
    return playerColor === (this.selectedMove % 2 === 1 ? 'b' : 'w') && (moveIsCheck || moveIsMate)
  }

  isInLastMove(coordinate: string): boolean {
    return (this.selectedGameState()?.moves.split(" ").at(-1) ?? "").includes(coordinate)
  }

  fen(): string {
    return this.selectedGameState().fen
  }

  moves(): string[] {
    return this.currentGame?.moves.split(" ") || []
  }

  numberedMoves(): string[] {
    let moves: string[] = []
    let ind = 1
    this.moves().forEach(move => {
      if (moves.length % 3 === 0) {
        moves.push("" + ind + ".")
        ind += 1
      }
      moves.push(move)
    });

    return moves
  }
  
  selectedGameState(): Game {
    let gameStateIndex = this.selectedMove - (Math.ceil(this.selectedMove / 3))
    return (this.currentGameStates[gameStateIndex+1] || this.currentGame!)
  }

  async setCurrentGame(game: Game, username: string) {
    this.playerUsername = username
    this.currentGame = game
    this.selectedMove = this.numberedMoves().length - 1
    
    this.currentPlayer = ['w', 'b'][game.moves.trim().split(" ").filter(move => move.length > 0).length % 2]
    if (this.playerUsername === this.currentGame.whitePlayerUsername) {
      this.opponentUsername = this.currentGame.blackPlayerUsername
      this.playerColor = 'w'
    } else {
      this.opponentUsername = this.currentGame.whitePlayerUsername
      this.playerColor = 'b'
    }
    this.currentValidMoves = await this.getValidMoves(this.currentGame.id!, this.playerColor)
    this.currentGameStates = await this.getGameStates(this.currentGame.id!)
  }

  async handleMove(game: Game) {
    this.currentGame = game
    this.currentGameStates.push(game)
    this.currentPlayer = (this.currentPlayer === 'w' ? 'b' : 'w')
    
    let nextIndex = this.numberedMoves().length - 1
    if (nextIndex % 3 === 0) nextIndex += 1
    this.selectedMove = nextIndex

    document.getElementById("" + nextIndex)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start'
    })    

    if (this.currentPlayer === this.playerColor) {
      this.currentValidMoves = await this.getValidMoves(this.currentGame.id!, this.playerColor)
    }
  }

  //#endregion

}
