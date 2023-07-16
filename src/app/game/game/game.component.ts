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
    console.log("Init GAME component");
    
    let gameId = this.route.snapshot.paramMap.get("id")
    if (gameId === null) {   
      console.log("null GameId");
         
      // reroute to 404 page?
      // this.router.navigate([""])
      return
    }
    
    let game = await this.gameService.getGame(gameId)    
    if (game === undefined) { 
      console.log("undefined Game");
      
      // reroute to 404 page
      // this.router.navigate([""])
      return
    }
    
    this.webSocketAPI = new WebsocketAPIService(this, gameId);
    this.connect()
    
    this.game = game;

    let playerUsername = await this.profileService.getUsername()
    console.log("Get Username", playerUsername, game);
    
    if (playerUsername === this.game.whitePlayerUsername) {
      this.playerColor = 'w'
    }else if (playerUsername === this.game.blackPlayerUsername) {
      this.playerColor = 'b'
    }
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
    let newGameState = JSON.parse(gameState)
    console.log(newGameState);
    if (!this.game) {
      this.game = newGameState
    } else{
      // TODO update necessary states
      this.game.FEN = newGameState.FEN
    }
  }

  // TODO rename this method - update implies persistence
  updateGameState(grid: tile[][]) {
    let currentGame = this.game!
    let gameState: Game = {
      ...currentGame,
      // TODO update necessary states
      FEN: this.boardUtil.TileArrToFEN(grid)
    }
    this.sendMove(gameState)
  }
}
