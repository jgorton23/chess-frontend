import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketAPIService } from 'src/app/websocket/websocket-api.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  webSocketAPI: WebsocketAPIService | null = null;

  moves: string[] = ["moves"];

  move: string = ""

  constructor(private route: ActivatedRoute) { }
  
  ngOnInit(): void {
    var gameId = this.route.snapshot.paramMap.get("id")
    this.webSocketAPI = new WebsocketAPIService(this, gameId!);
    this.connect()
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
