import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketAPIService } from 'src/app/shared/api/websocket.service';
import { GameService } from '../shared/api/game.service';
import { Game } from '../shared/api/game.service';
import { BoardUtilService } from 'src/app/board/board-util.service';
import { ProfileService } from 'src/app/shared/api/profile.service';
import { Move } from 'src/app/board/board.component';
import { firstValueFrom } from 'rxjs';

export type RematchRequest = {
  whitePlayerConfirmed: boolean,
  blackPlayerConfirmed: boolean,
  newGameId?: string
}

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

  showChat: boolean = false;

  chatsPending: boolean = false;

  rematchRequest: RematchRequest = {
    whitePlayerConfirmed: false,
    blackPlayerConfirmed: false
  }

  gameOverMessage: string = '';

  promotionPiece: EventEmitter<string> = new EventEmitter();

  resignation: EventEmitter<boolean> = new EventEmitter();

  selectedMove: number = (this.gameService.currentGame?.moves.split(" ").length ?? 1) - 1

  chats: string[] = []

  chat: string = ''

  moveSeconds: number = 0

  timer: number = 0

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

  timeLeft(player: string): string {
    if (this.gameService.currentGame?.timeControl) {
      let initialMinutes: number = +this.gameService.currentGame.timeControl.split("/")[0]
      let seconds: number = initialMinutes * 60;
      let moveTimes = this.gameService.currentGame.moveTimes.split(" ");
      if (player === 'b') {
        if (moveTimes.length > 1) {
          seconds -= moveTimes.map(t => +t / 1000).filter((_, i) => i % 2 === 1).reduce((prev, curr) => prev+curr)
        }
        if (this.currentPlayer === 'b') {
          seconds -= this.moveSeconds
        }
      } else {
        if (moveTimes.length !== 0) {
          seconds -= moveTimes.map(t => +t / 1000).filter((_, i) => i % 2 === 0).reduce((prev, curr) => prev+curr)
        }
        if (this.currentPlayer === 'w') {
          seconds -= this.moveSeconds
        }
      }
      return "" + (Math.floor(seconds / 60)) + ":" + ("" + (seconds % 60)).padStart(2, "0")
    } else {
      return "";
    }
  }

  playerTime(): string {
    return this.timeLeft(this.playerColor);
  }

  opponentTime(): string {
    return this.timeLeft(this.playerColor === 'b' ? 'w' : 'b');
  }

  fen(): string {
    return this.gameService.currentGame?.fen ?? ""
  }

//#region move selector

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

//#endregion

  isGameOver(): boolean {
    return this.gameService.currentGame?.result !== '*'
  }

  pieces(): string[] {
    return ['q', 'r', 'b', 'n'].map((p) => this.currentPlayer === 'w' ? p.toUpperCase() : p)
  }

  navigate(page: string) {
    this.router.navigate([page])
  }

  //#region websocket

  /**
   * Connects to the ws
   */
  connect(): void {
    if (!this.webSocketAPI) {
      this.webSocketAPI = new WebsocketAPIService(this, this.gameService.currentGame!.id!)
    }
    this.webSocketAPI._connect();
  }

  /**
   * disconnnects from the ws
   */
  disconnect(): void {
    if (this.webSocketAPI){
      this.webSocketAPI._disconnect();
    }
  }

  /**
   * sends a move to the ws to be done
   * @param move the move to do
   */
  sendMove(move: Move): void {
  if (this.webSocketAPI){
      this.webSocketAPI._sendMove(move);
    }
  }

  /**
   * send a chat to the opponent
   */
  sendChat(): void {
    if (this.webSocketAPI){
      this.webSocketAPI._sendChat(this.playerUsername() + ': ' + this.chat);
      this.chat = ''
    }
  }

  /**
   * resign
   */
  sendResign(): void {
    if (this.webSocketAPI){      
      this.webSocketAPI._sendResign(this.playerUsername())
    }
  }

  /**
   * request a rematch
   */
  sendRematch(): void {
    if (this.playerColor === 'w') {
      this.rematchRequest.whitePlayerConfirmed = true
    } else {
      this.rematchRequest.blackPlayerConfirmed = true
    }

    if (this.webSocketAPI) {
      this.webSocketAPI._sendRematchOffer(this.rematchRequest);
    }
  }

  sendTimeout(): void {
    if (this.webSocketAPI){
      this.webSocketAPI._sendTimeout(this.playerUsername())
    }
  }

  /**
   * Show/hide the chat box
   */
  toggleChat(): void {
    this.showChat = !this.showChat
    this.chatsPending = false;
  }

  /**
   * Updates the game state, showing the gameOver popup if relevant. Otherwise get the valid moves for the next player
   * @param game the new gameState
   */
  handleMove(game: Game): void {
    
    this.gameService.currentGame = game
    this.validMoves = []

    if (game.result !== '*') {
      this.gameOverMessage = (this.currentPlayer === 'w' ? 'White' : 'Black') + " player won by checkmate";
      this.showGameOverPopup = true;
      return;
    }

    this.moveSeconds = 0
    if (this.timer === 0) {
      this.timer = setInterval(_ => {
        this.moveSeconds += 1
        if (this.playerTime() === '0:00') {
          clearInterval(this.timer)
          this.sendTimeout()
        }
      }, 1000)
    }

    this.currentPlayer = (this.currentPlayer === 'w' ? 'b' : 'w')

    if (this.currentPlayer === this.playerColor) {
      this.gameService.getValidMoves(this.gameService.currentGame!.id!, this.playerColor)
        .then(validMoves => {
          this.validMoves = validMoves
        })
    }

  }

  /**
   * Adds a chat to the chat room
   * @param chat the chat to be added
   */
  handleChat(chat: string): void {
    this.chats.push(chat);
    if (!this.showChat) {
      this.chatsPending = true;
    }
  }

  /**
   * Shows the game over popup
   * @param username The username of the player who resigned
   */
  handleResignation(username: string): void {
    this.gameOverMessage = username + " resigned"
    this.showGameOverPopup = true;
  }

  /**
   * If both players agreed to the rematch, redirect the user to the new game, otherwise update the local request information
   * @param request containing the status of the rematch request, and possibly the new gameId
   */
  handleRematchOffer(request: RematchRequest) {    
    if (request.newGameId) {
      this.showGameOverPopup = false
      this.router.navigate(['play', {id: request.newGameId}]).then(_ => this.ngOnInit())
    } else {
      this.rematchRequest = request
    }
  }

  /**
   * Shows the game over popup with a timeout message
   * @param username the username of the player who ran out of time
   */
  handleTimeout(username: string) {
    this.gameOverMessage = username + " ran out of time"
    this.showGameOverPopup = true
  }

  /**
   * Handle a move from the moveEmitter - accepts a partial move and creates a complete move.
   * If the move is a promotion, show the popup and wait for the response
   * 
   * @param moveData the partial move emitted from the board
   */
  async performMove(moveData: Partial<Move>): Promise<void> {
    if (!this.gameService.currentGame || !this.gameService.currentGame.id) {
      return
    }

    let move: Move = {
      startSquare: [],
      destSquare: [],
      piece: '',
      isCheck: false,
      isMate: false,
      isCapture: false,
      playerUsername: '',
      promotion: '',
      miliseconds: 0,
      ...moveData
    }

    if (move.piece.toLowerCase() === 'p' && move.destSquare[1] % 7 === 0) {
      this.showPromotionPopup = true;
      move.promotion = await firstValueFrom(this.promotionPiece.asObservable())
      this.showPromotionPopup = false;
      if (!"qbnr".includes(move.promotion.toLowerCase())) {
        return
      }
    }
    
    let dest = String.fromCharCode(97+move.destSquare[0]) + Math.abs(move.destSquare[1] - 8)
    let moveString = this.validMoves.find(m => m.startsWith(move.piece) && m.includes(dest))
    if (moveString) {
      move.isCapture = moveString.includes("x")
      move.isCheck = moveString.includes("+")
      move.isMate = moveString.includes("#")
      move.miliseconds = this.moveSeconds * 1000
      move.playerUsername = await this.profileService.getUsername()
      this.validMoves = []
      this.sendMove(move)
    }
  }

  /**
   * Handles the user pressing the resign flag, 
   * First show the popup, then wait for the confirmation or cancelation, then hide the popup
   */
  async resign(): Promise<void> {

    this.showResignConfirmationPopup = true;
    
    if (await firstValueFrom(this.resignation)) {
      this.sendResign()
    }
    
    this.showResignConfirmationPopup = false;

  }

  //#endregion
}
