import { Inject, Injectable } from '@angular/core';
import { GameComponent } from '../game/game/game.component';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketAPIService {
  wsEndpoint: string = 'http://localhost:8080/websocket'
  topic: string = '/game'
  stompClient: any;

  constructor(private game: GameComponent, @Inject(String) private gameId: string) { }

  _connect() {
    let ws = new SockJS(this.wsEndpoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect({}, function (frame: any) {
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId, function (sdkEvent: any) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this._error);
  }

  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
  }

  _send(message: any) {
    this.stompClient.send(this.topic + '/' + this.gameId, {}, JSON.stringify(message));
  }

  _error(error: Error) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
        this._connect()
    }, 5000);
  }

  onMessageReceived(message: any) {
    console.log("socket got message", message.body);
    
    this.game.handleMove(message.body);
  }
}

