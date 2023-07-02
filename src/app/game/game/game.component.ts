import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketAPIService } from 'src/app/websocket/websocket-api.service';
import { Game, GameService } from '../game.service';
import { BoardUtilService } from 'src/app/board/board-util.service';
import { ProfileService } from 'src/app/shared/profile.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  webSocketAPI: WebsocketAPIService | null = null;

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

    let playerUsername = this.profileService.getUsername()
    if (playerUsername === this.game.whitePlayerUsername) {
      this.playerColor = 'w'
    }else if (playerUsername === this.game.blackPlayerUsername) {
      this.playerColor = 'b'
    }
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

  handleMove(gameState: Game) {

  }

  updateGameState() {
    console.log(this.game);
    
  }
}
