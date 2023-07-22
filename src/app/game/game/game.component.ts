import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketAPIService } from 'src/app/websocket/websocket-api.service';
import { Game, GameService } from '../game.service';
import { BoardUtilService, tile } from 'src/app/board/board-util.service';
import { ProfileService } from 'src/app/shared/profile.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  webSocketAPI?: WebsocketAPIService;

  game?: Game;

  playerColor: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameService: GameService,
    public boardUtil: BoardUtilService,
    private profileService: ProfileService) { }
  
  async ngOnInit(): Promise<void> {
    
    let gameId = this.route.snapshot.paramMap.get("id")
    if (gameId === null) {   
      this.router.navigate(["notfound"])
      return
    }
    
    this.gameService.getGame(gameId)
      .then(game => {
        if (game === undefined) {
          this.router.navigate(["notfound"])
          return Promise.reject(game)
        } else {
          this.game = game
          return this.profileService.getUsername()
        }
      }).then(username => {
        if (username === undefined) {
          this.router.navigate(['login'])
          Promise.reject(username)
        } else {
          switch(username){
            case this.game?.whitePlayerUsername:
              this.playerColor = 'w'
              break
            case this.game?.blackPlayerUsername:
              this.playerColor = 'b'
              break
          }
        }
      }).catch(error => {
        if (error.status === 401) {
          this.router.navigate(['login'])
        } else {
          error.json().then((e: any) => console.error(e))
        }
      })
    
    this.webSocketAPI = new WebsocketAPIService(this, gameId);
    this.connect()
    
  }

  ngOnDestroy(): void {
    this.disconnect()
  }

  connect() {
    if (!this.webSocketAPI) {
      this.webSocketAPI = new WebsocketAPIService(this, this.game!.id!)
    }
    this.webSocketAPI._connect();
  }

  disconnect() {
    if (this.webSocketAPI){
      this.webSocketAPI._disconnect();
    }
  }

  sendMove(gameState: Game) {
    if (this.webSocketAPI){
      gameState.date = undefined
      this.webSocketAPI._send(gameState);
    }
  }

  handleMove(gameState: string) {
    let newGameState: Game = JSON.parse(gameState)
    if (!this.game) {
      this.game = newGameState
    } else{
      this.game.moves = newGameState.moves
      this.game.fen = newGameState.fen
    }
  }

  performMove(moveData: {move: number[][], FEN: string}) {
    if (!this.game) {
      return
    }

    let gameState: Game = {
      ...this.game,
      fen: moveData.FEN,
      moves: this.game.moves
    }
    this.sendMove(gameState)
  }
}
