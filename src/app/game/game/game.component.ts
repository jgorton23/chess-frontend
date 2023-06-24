import { Component, OnInit } from '@angular/core';
import { WebsocketAPIService } from 'src/app/websocket/websocket-api.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  webSocketAPI: WebsocketAPIService | null = null;
  moves: string[] = [];

  constructor() { }

  
  ngOnInit(): void {
    this.webSocketAPI = new WebsocketAPIService(this, '123');
    this.connect()
  }

  connect() {
    this.webSocketAPI!._connect();
  }

  disconnect() {
    this.webSocketAPI!._disconnect();
  }

  sendMove() {
    this.webSocketAPI!._send("test");
  }

  handleMove(move: string) {
    this.moves.push(move);
  }

}
