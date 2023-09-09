import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketAPIService } from 'src/app/shared/api/websocket.service';
import { GameService } from '../shared/api/game.service';
import { Game } from '../shared/api/game.service';
import { BoardUtilService } from 'src/app/board/board-util.service';
import { ProfileService } from 'src/app/shared/api/profile.service';
import { Move } from 'src/app/board/board.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  webSocketAPI?: WebsocketAPIService;

  playerColor: string = ' ';

  validMoves: string[] = []

  currentPlayer: string = 'w'

  loading: boolean = true

  showPromotionPopup: boolean = false;

  showResignConfirmationPopup: boolean = false;

  showGameOverPopup: boolean = false;

  gameOverMessage: string = '';

  promotionPiece: EventEmitter<string> = new EventEmitter();

  resignation: EventEmitter<boolean> = new EventEmitter();

  selectedMove: number = (this.gameService.currentGame?.moves.split(" ").length ?? 1) - 1

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
          this.gameService.currentGame = game
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
            case this.gameService.currentGame?.whitePlayerUsername:
              this.playerColor = 'w'
              break
            case this.gameService.currentGame?.blackPlayerUsername:
              this.playerColor = 'b'
              break              
          }
          if (this.playerColor === this.currentPlayer){
            return this.gameService.getValidMoves(this.gameService.currentGame!.id!, this.playerColor)
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
    this.gameService.currentGame = undefined
    this.disconnect()
  }

  playerUsername(): string {
    return (this.playerColor === "b" ?
      this.gameService.currentGame?.blackPlayerUsername :
      this.gameService.currentGame?.whitePlayerUsername) || ""
  }

  opponentUsername(): string {
    return (this.playerColor === "b" ?
      this.gameService.currentGame?.whitePlayerUsername :
      this.gameService.currentGame?.blackPlayerUsername) || ""
  }

  fen(): string {
    return this.gameService.currentGame?.fen ?? ""
  }

  moves(): string[] {
    return this.gameService.currentGame?.moves.split(" ") ?? []
  }

  isSelected(i: number) {
    return i === this.selectedMove
  }

  previousMove() {
    let nextIndex = this.selectedMove + 1
    if (nextIndex % 3 === 2) {
      nextIndex += 1
    }
    let move = document.getElementById("" + nextIndex)
    
    move?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start'
    })
    this.selectedMove = Math.min(this.gameService.currentGame?.moves.split(" ").length ?? 1 - 1, nextIndex)
  }
  
  nextMove() {
    let nextIndex = this.selectedMove - 1
    if (nextIndex % 3 === 2) {
      nextIndex -= 1
    }
    let move = document.getElementById("" + nextIndex)

    move?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start'
    })
    this.selectedMove = Math.max(0, nextIndex)
  }

  select(i: number) {
    this.selectedMove = i
  }

  async resign() {
    this.showResignConfirmationPopup = true;
    let confirm = await firstValueFrom(this.resignation)
    console.log(confirm);
    
    if (confirm) {
      this.gameService.resign()
    }
    this.showResignConfirmationPopup = false;
  }

  pieces(): string[] {
    return ['q', 'r', 'b', 'n'].map((p) => this.currentPlayer === 'w' ? p.toUpperCase() : p)
  }

  navigate(page: string) {
    this.router.navigate([page])
  }

  offerRematch() {
    // todo - if they offered rematch, send rematch accept and redirect to the new page
    // todo - otherwise
    // todo - send ws message signifying rematch offer
    // todo - await ws response signifying rematch accepted
  }

  //#region websocket

  connect() {
    if (!this.webSocketAPI) {
      this.webSocketAPI = new WebsocketAPIService(this, this.gameService.currentGame!.id!)
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

    if (move.isMate) {
      this.showGameOverPopup = true;
      this.gameOverMessage = (this.currentPlayer === 'w' ? 'White' : 'Black') + " player won by checkmate"
    } else {
      this.currentPlayer = (this.currentPlayer === 'w' ? 'b' : 'w')
      if (this.currentPlayer === this.playerColor) {
        this.gameService.getValidMoves(this.gameService.currentGame!.id!, this.playerColor)
          .then(validMoves => {
            this.validMoves = validMoves
          })
      } else {
        this.validMoves = []
      }
    }

    this.gameService.getGame(this.gameService.currentGame!.id!)
      .then(game => {this.gameService.currentGame = game})
  }

  async performMove(moveData: Move) {
    if (!this.gameService.currentGame || !this.gameService.currentGame.id) {
      return
    }

    if (moveData.piece.toLowerCase() === 'p' && moveData.destSquare[1] % 7 === 0) {
      this.showPromotionPopup = true;
      moveData.promotion = await firstValueFrom(this.promotionPiece.asObservable())
      this.showPromotionPopup = false;
      console.log(moveData.promotion);
      if (!"qbnr".includes(moveData.promotion.toLowerCase())) {
        return
      }
    }
    
    let dest = String.fromCharCode(97+moveData.destSquare[0]) + Math.abs(moveData.destSquare[1] - 8)
    let moveString = this.validMoves.find(m => m.startsWith(moveData.piece) && m.includes(dest))
    if (moveString) {
      moveData.isCapture = moveString.includes("x")
      moveData.isCheck = moveString.includes("+")
      moveData.isMate = moveString.includes("#")
      this.validMoves = []
      this.gameService.doMove(moveData, this.gameService.currentGame.id).then(() => this.sendMove(moveData))
    }
  }

  //#endregion
}
