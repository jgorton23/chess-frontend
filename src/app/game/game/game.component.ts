import { Component, OnInit } from '@angular/core';
import { WebsocketAPIService } from 'src/app/websocket/websocket-api.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  webSocketAPI: WebsocketAPIService = new WebsocketAPIService(new GameComponent(), '123');

  constructor() { }

  
  ngOnInit(): void {
    this.webSocketAPI = new WebsocketAPIService(new GameComponent(), '123');
  }

  connect() {

  }

  disconnect() {

  }

  sendMove() {

  }

  handleMove(move: string) {

  }

}
