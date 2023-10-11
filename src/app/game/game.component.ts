import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketAPIService } from 'src/app/shared/api/websocket.service';
import { GameService } from '../shared/api/game.service';
import { Game } from '../shared/api/game.service';
import { BoardUtilService } from 'src/app/board/board-util.service';
import { ProfileService, Status } from 'src/app/shared/api/profile.service';
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

  loading: boolean = true

  //#region modals

  // promotion modal

  showPromotionPopup: boolean = false;
  
  promotionPiece: EventEmitter<string> = new EventEmitter();

  // resignation modal

  showResignConfirmationPopup: boolean = false;
  
  resignation: EventEmitter<boolean> = new EventEmitter();

  // game over modal

  showGameOverPopup: boolean = false;
  
  gameOverMessage: string = '';

  // chat variables 

  showChat: boolean = false;
  
  chatsPending: boolean = false;
  
  chats: string[] = []
  
  chat: string = ''

  //#endregion

  rematchRequest: RematchRequest = {
    whitePlayerConfirmed: false,
    blackPlayerConfirmed: false
  }

  moveSeconds: number = 0

  timer: number = 0

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameService: GameService,
    public boardUtil: BoardUtilService,
    private profileService: ProfileService) { }
  
  async ngOnInit() {

    let gameId = this.route.snapshot.paramMap.get("id")
    
    if (gameId === null) {  
      this.router.navigate(["notfound"])
      return
    }

    this.profileService.updateSession(Status.PLAYING, gameId)
    let username = await this.profileService.getUsername()
    
    this.gameService.getGame(gameId)
      .then(game => {        
        if (game === undefined || game.id === undefined) {
          this.router.navigate(["notfound"])
          return Promise.reject()
        } else {
          this.webSocketAPI = new WebsocketAPIService(this, game.id);
          this.connect()
          return this.gameService.setCurrentGame(game, username)
        }
      }).then(() => {
        this.loading = false;
      }).catch(error => {
        console.error(error)
      })
    
  }

  ngOnDestroy(): void {
    this.gameService.currentGame = undefined
    this.profileService.updateSession(Status.OFFLINE, '')
    this.disconnect()
    clearInterval(this.timer)
  }

  playerColor(): string {    
    return this.gameService.playerColor
  }

  playerUsername(): string {
    return this.gameService.playerUsername
  }

  opponentUsername(): string {
    return this.gameService.opponentUsername
  }

  timeLeft(player: string): string {
    if (this.gameService.currentGame?.timeControl) {
      let initialMinutes: number = +this.gameService.currentGame.timeControl.split("/")[0]
      let seconds: number = initialMinutes * 60;
      let moveTimes = this.gameService.currentGame.moveTimes.split(" ");
      let mod = player === 'b' ? 1 : 0
      if (moveTimes.length > 0) {
        seconds -= moveTimes
                    .map(t => (+t / 1000) - this.increment())
                    .filter((_, i) => i % 2 === mod)
                    .reduce((prev, curr) => prev+curr)
      }
      if (player === this.gameService.currentPlayer) {
        seconds -= this.moveSeconds
      }
      return "" + (Math.floor(seconds / 60)) + ":" + ("" + (seconds % 60)).padStart(2, "0")
    } else {
      return "";
    }
  }

  playerTime(): string {
    return this.timeLeft(this.gameService.playerColor);
  }

  opponentTime(): string {
    return this.timeLeft(this.gameService.playerColor === 'w' ? 'b' : 'w');
  }

  increment(): number {
    return +(this.gameService.currentGame?.timeControl.split(":").at(-1) || 0)
  }

  fen(): string {
    return this.gameService.fen()
  }

//#region move selector

  moves(): string[] {
    return this.gameService.numberedMoves()
  }

  isSelected(i: number) {    
    return i === this.gameService.selectedMove
  }

  previousMove() {    
    let nextIndex = this.gameService.selectedMove - 1
    if (nextIndex % 3 === 0) nextIndex -= 1
    if (nextIndex >= 0) this.gameService.selectedMove = nextIndex

    console.log(this.gameService.selectedMove, this.gameService.selectedGameState());
    console.log(this.gameService.currentGameStates);
    console.log(this.gameService.selectedMove - (Math.ceil(this.gameService.selectedMove / 3)));
    
    
    document.getElementById("" + nextIndex)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start'
    })
  }
  
  nextMove() {    
    let nextIndex = this.gameService.selectedMove + 1
    if (nextIndex % 3 === 0) nextIndex += 1
    if (nextIndex < this.moves().length) this.gameService.selectedMove = nextIndex
    
    // console.log(this.gameService.selectedMove);
    console.log(this.gameService.selectedMove - (Math.ceil(this.gameService.selectedMove / 3)));
    
    document.getElementById("" + nextIndex)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start'
    })
  }

  select(i: number) {
    if (i % 3 !== 0) this.gameService.selectedMove = i
  }

//#endregion

  isGameOver(): boolean {
    return this.gameService.currentGame?.result !== '*'
  }

  pieces(): string[] {
    return ['q', 'r', 'b', 'n'].map((p) => this.gameService.currentPlayer === 'w' ? p.toUpperCase() : p)
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
    if (this.gameService.playerColor === 'w') {
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

    console.log("HANDLE MOVE")
    if (game.result !== '*'){
      if (game.result === '1-0') {
        this.gameOverMessage = "White player won by checkmate";
      } else if (game.result === '0-1') {
        this.gameOverMessage = "Black player won by checkmate";
      } else if (game.result === '1/2-1/2') {
        this.gameOverMessage = "Draw by stalemate";
      }
      this.showGameOverPopup = true;
      return;
    }

    console.log("TEST1");
    
    
    this.moveSeconds = 0
    if (this.timer === 0) {
      this.timer = setInterval(_ => {
        this.moveSeconds += 1
        if (this.playerTime() === '0:00') {
          this.sendTimeout()
        }
      }, 1000)
    }
    console.log("TEST2");
    
    this.gameService.handleMove(game)
    console.log(this.gameService.fen());
    console.log("TEST3");
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
    clearInterval(this.timer)
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
      isStalemate: false,
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
    let moveString = this.gameService.currentValidMoves.find(m => m.startsWith(move.piece) && m.includes(dest))
    if (moveString) {
      move.isCapture = moveString.includes("x")
      move.isCheck = moveString.includes("+")
      move.isMate = moveString.includes("#")
      move.isStalemate = moveString.includes("$")
      move.miliseconds = this.moveSeconds * 1000
      move.playerUsername = await this.profileService.getUsername()
      this.gameService.currentValidMoves = []
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
