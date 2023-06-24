import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketAPIService {
  wsEndpoint: string = 'http://localhost:8080/websocket'
  topic: string = '/game'

  constructor() { }

  _connect() {
  
  }

  _disconnect() {

  }

  _send(message: string) {

  }

  _error(error: Error) {

  }

  onMessageRecieved(message: string) {

  }
}

