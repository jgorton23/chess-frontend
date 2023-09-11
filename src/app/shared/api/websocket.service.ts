import { Inject, Injectable } from '@angular/core';
import { GameComponent } from '../../game/game.component';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Move } from 'src/app/board/board.component';

@Injectable({
  providedIn: 'root'
})
export class WebsocketAPIService {

  /**
   * The path of the ws endpoint of the socket to connect to 
   */
  wsEndpoint: string = 'http://localhost:8080/websocket'

  /**
   * the base path of the topic to subscribe to
   */
  topic: string = '/topic/game'

  /**
   * the client to send/recieve messages
   */
  stompClient: any;

  /**
   * Create a new WSService instance
   * @param game the game component that this ws should allow to handle messages received
   * @param gameId the id of the game to be used in the WS subscription path
   */
  constructor(private game: GameComponent, @Inject(String) private gameId: string) { }

  /**
   * Subscribe to the ws endpoint based on this objects gameId
   */
  _connect() {
    let ws = new SockJS(this.wsEndpoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect({}, function (frame: any) {
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId, function (sdkEvent: any) {
        _this.onMessageReceived(sdkEvent);
      });
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/chat', function (sdkEvent: any) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this._error);
  }

  /**
   * disconnect from the ws
   */
  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
  }

  /**
   * send a Move over the socket
   * @param message the message to send
   */
  _sendMove(message: Move) {
    this.stompClient.send('/app/game/' + this.gameId, {}, JSON.stringify(message));
  }
  
  /**
   * Sends a chat over the socket connection
   * @param message the chat message to send across the socket
   */
  _sendChat(message: string) {
    this.stompClient.send('/app/game/' + this.gameId + '/chat', {}, JSON.stringify(message));
  }

  /**
   * On ws error, log error and attempt to reconnect
   * @param error 
   */
  _error(error: Error) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
        this._connect()
    }, 5000);
  }

  /**
   * On ws message, pass the message body to the game component for handling
   * @param message 
   */
  onMessageReceived(message: any) {
    console.log("socket got message", message.body);
    this.game.handleMove(message.body);
  }
}

