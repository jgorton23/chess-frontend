import { Component, OnInit } from '@angular/core';
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
export class GameComponent implements OnInit {

  webSocketAPI: WebsocketAPIService | null = null;

  game?: Game;

  fen: string = "";

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
      // reroute to 404 page?
      // this.router.navigate([""])
      return
    }
    
    this.webSocketAPI = new WebsocketAPIService(this, gameId!);
    this.connect()
        
    let game = await this.gameService.getGame(gameId)    
    if (game === undefined) {      
      // reroute to 404 page
      // this.router.navigate([""])
      return
    }

    this.game = game;
    this.fen = game.board

    let playerUsername = this.profileService.getUsername()
    if (playerUsername === this.game.whitePlayerUsername) {
      this.playerColor = 'w'
    }else if (playerUsername === this.game.blackPlayerUsername) {
      this.playerColor = 'b'
    }
  }

  getFen(): string {
    return this.fen
  }

  connect() {
    this.webSocketAPI!._connect();
  }

  disconnect() {
    this.webSocketAPI!._disconnect();
  }

  sendMove(gameState: Game) {
    this.webSocketAPI!._send(gameState);
  }

  handleMove(gameState: string) {
    let newGameState = JSON.parse(gameState)
    this.fen = newGameState.board
  }

  updateGameState(grid: tile[][]) {
    let currentGame = this.game!
    let gameState: Game = {
      ...currentGame,
      board: this.boardUtil.TileArrToFEN(grid),
      turn: (currentGame.turn + 1) % 2,
      whiteTime: currentGame.whiteTime - 0,
      blackTime: currentGame.blackTime - 0,
    }
    this.sendMove(gameState)
  }
}
