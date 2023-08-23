import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketAPIService } from 'src/app/shared/api/websocket/websocket-api.service';
import { Game, GameService } from '../game.service';
import { BoardUtilService } from 'src/app/board/board-util.service';
import { ProfileService } from 'src/app/shared/profile.service';
import { Move } from 'src/app/board/board.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  webSocketAPI?: WebsocketAPIService;

  game?: Game;

  playerColor: string = ' ';

  validMoves: string[] = []

  currentPlayer: string = 'w'

  isChecked: string = '';

  loading = true

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameService: GameService,
    public boardUtil: BoardUtilService,
    private profileService: ProfileService) { }
  
  ngOnInit(): void {

    let gameId = this.route.snapshot.paramMap.get("id")
    
    if (gameId === null) {  
      this.router.navigate(["notfound"])
      return
    }
    
    this.gameService.getGame(gameId)
      .then(game => {        
        if (game === undefined || game.id === undefined) {
          this.router.navigate(["notfound"])
          return Promise.reject("Game is undefined or has no id: " + game)
        } else {
          this.game = game          
          this.currentPlayer = game.moves.trim().split(" ").length % 3 <= 1 ? 'w' : 'b'
          this.webSocketAPI = new WebsocketAPIService(this, game.id);
          this.connect()
          return this.profileService.getUsername()
        }
      }).then(username => {
        if (username === undefined) {
          this.router.navigate(['login'])
          return Promise.reject("Username is undefined: " + username)
        } else {
          switch(username){
            case this.game?.whitePlayerUsername:
              this.playerColor = 'w'
              break
            case this.game?.blackPlayerUsername:
              this.playerColor = 'b'
              break              
          }
          if (this.playerColor === this.currentPlayer){
            return this.gameService.getValidMoves(this.game!.id!, this.playerColor)
          } else {
            return []
          }
        }
      }).then(validMoves => {
        this.validMoves = validMoves
        this.loading = false
      }).catch(error => {
        console.error(error)
      })
    
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

  sendMove(move: Move) {
    if (this.webSocketAPI){
      this.webSocketAPI._send(move);
    }
  }

  handleMove(moveData: string) {
    let move: Move = JSON.parse(moveData)
    
    this.isChecked = ''
    this.currentPlayer = (this.currentPlayer === 'w' ? 'b' : 'w')
    if (move.isCheck) {
      this.isChecked = this.currentPlayer
    }
    if (this.currentPlayer === this.playerColor) {
      this.gameService.getValidMoves(this.game!.id!, this.playerColor)
        .then(validMoves => {
          this.validMoves = validMoves
        })
    } else {
      this.validMoves = []
    }


    this.gameService.getGame(this.game!.id!)
      .then(game => {this.game = game})
  }

  performMove(moveData: Move) {
    if (!this.game || !this.game.id) {
      return
    }
    let dest = String.fromCharCode(97+moveData.destSquare[0]) + Math.abs(moveData.destSquare[1] - 8)
    let moveString = this.validMoves.find(m => m.startsWith(moveData.piece) && m.includes(dest))
    if (moveString) {
      moveData.isCapture = moveString.includes("x")
      moveData.isCheck = moveString.includes("+")
      moveData.isMate = moveString.includes("#")
      this.validMoves = []
      this.gameService.doMove(moveData, this.game.id).then(() => this.sendMove(moveData))
    }
  }
}
