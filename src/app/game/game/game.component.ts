import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketAPIService } from 'src/app/websocket/websocket-api.service';
import { Game, GameService } from '../game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  webSocketAPI: WebsocketAPIService | null = null;

  moves: string[] = ["moves"];

  move: string = ""

  game!: Game;

  constructor(private router: Router, private route: ActivatedRoute, private gameService: GameService) { }
  
  ngOnInit(): void {
    let gameId = this.route.snapshot.paramMap.get("id")
    if (gameId === null) {
      // reroute to 404 page?
      // this.router.navigate([""])
      return
    }
    
    this.webSocketAPI = new WebsocketAPIService(this, gameId!);
    this.connect()
    
    let game = this.gameService.getGame(gameId)
    if (game === undefined) {
      // reroute to 404 page
      // this.router.navigate([""])
      return
    }

    this.game = game;
  }

  connect() {
    this.webSocketAPI!._connect();
  }

  disconnect() {
    this.webSocketAPI!._disconnect();
  }

  sendMove(move: string) {
    this.webSocketAPI!._send(move);
  }

  handleMove(move: string) {
    this.moves.push(move.slice(1, move.length-1));        
  }

}
