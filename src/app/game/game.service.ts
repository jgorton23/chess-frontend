import { Injectable } from '@angular/core';

export type Game = {
  id: String,
  moves: String,
  board: String[],
  turn: number,
  whiteTime: number,
  blackTime: number,
  whitePlayerId: String,
  blackPlayerId: String,
  whitePlayerUsername: String,
  blackPlayerUsername: String,
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { }
}
