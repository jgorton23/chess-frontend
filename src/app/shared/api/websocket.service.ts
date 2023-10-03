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
  constructor(private game: GameComponent, @Inject(String) private gameId: string) {
    console.log(this);
    
  }

  /**
   * Subscribe to the ws endpoints based on this objects gameId
   */
  _connect() {
    let ws = new SockJS(this.wsEndpoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect({}, function (_: any) {
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId, (event: any) => _this.onMoveReceived(event));
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/chat', (event: any) => _this.onChatReceived(event));
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/resign', (event: any) => _this.onResignReceived(event));
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/rematch', (event: any) => _this.onRematchReceived(event));
      _this.stompClient.subscribe(_this.topic + '/' + _this.gameId + '/timeout', (event: any) => _this.onTimeoutReceived(event));
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
 * On ws error, log error and attempt to reconnect
 * @param error 
 */
  _error(error: Error) {
    console.error("errorCallBack -> " + error)
    setTimeout(() => {
        this._connect()
    }, 5000);
  }

  //#region Send WebSocket messages

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
   * Sends a resignation request over the socket connection
   * @param message the resignation request to send
  */
  _sendResign(message: string) {    
    this.stompClient.send('/app/game/' + this.gameId + '/resign', {}, JSON.stringify(message));
  }

  /**
   * Sends a rematch request across the socket connection
   * @param request the rematch request to send
   */
  _sendRematchOffer(request: RematchRequest) {
    this.stompClient.send('/app/game/' + this.gameId + '/rematch', {}, JSON.stringify(request))
  }

  /**
   * sends a timeout message across the websocket connection
   * @param message the username of the player who timed out
   */
  _sendTimeout(message: string) {
    this.stompClient.send('/app/game/' + this.gameId + '/timeout', {}, JSON.stringify(message))
  }

  //#endregion

  //#region WebSocket Callback functions

  /**
   * Pass the Move received from the WebSocket to the Game to be handled
   * @param message the message from the WebSocket containing a move
   */
  onMoveReceived(message: any) {
    console.log(message.body);
    console.log(this);
    
    
    let gameState = JSON.parse(message.body);
    console.log(this);
        
    this.game.handleMove(gameState);
  }

  /**
   * Pass the chat received from the WebSocket to the Game to be handled
   * @param message the message from the WebSocket containing a chat
   */
  onChatReceived(message: any) {
    let chat = JSON.parse(message.body);
    this.game.handleChat(chat);
  }

  /**
   * Pass the resignation request from the WebSocket to the Game to be handled
   * @param message the message from the WebSocket containing a resignation request
   */
  onResignReceived(message: any) {
    let username = JSON.parse(message.body);
    this.game.handleResignation(username);
  }

  /**
   * Pass the rematch request from the WebSocket to the Game to be handled
   * @param message the message from the WebSocket containing a rematch request
   */
  onRematchReceived(message: any) {
    let rematchRequest = JSON.parse(message.body);
    this.game.handleRematchOffer(rematchRequest);
  }

  /**
   * Pass the username of the player who ran out of time to the Game to be handled
   * @param message the username of the player who timedout
   */
  onTimeoutReceived(message: any) {
    let username = JSON.parse(message)
    this.game.handleTimeout(username)
  }

  //#endregion

}

