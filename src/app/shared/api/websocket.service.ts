import { Inject, Injectable } from '@angular/core';
import { GameComponent, RematchRequest } from '../../game/game.component';
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
        _this.onMoveReceived(sdkEvent);
      });
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/chat', function (sdkEvent: any) {
        _this.onChatReceived(sdkEvent);
      });
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/resign', function (sdkEvent: any) {        
        _this.onResignReceived(sdkEvent);
      });
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/rematch', function (sdkEvent: any) {
        _this.onRematchReceived(sdkEvent);
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

  _sendResign(message: string) {    
    this.stompClient.send('/app/game/' + this.gameId + '/resign', {}, JSON.stringify(message));
  }

  _sendRematchOffer(request: RematchRequest) {
    this.stompClient.send('/app/game/' + this.gameId + '/rematch', {}, JSON.stringify(request))
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
  onMoveReceived(message: any) {
    console.log("socket got move", message.body);
    this.game.handleMove(message.body);
  }

  onChatReceived(message: any) {
    console.log("socket got chat", message.body)
    this.game.handleChat(message.body);
  }

  onResignReceived(message: any) {
    console.log("socket got resign", message.body);
    this.game.handleResignation(message.body);
  }

  onRematchReceived(confirm: any) {
    console.log("socket got rematch", confirm.body);
    this.game.handleRematchOffer(JSON.parse(confirm.body));
  }
}

