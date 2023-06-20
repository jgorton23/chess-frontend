import { Injectable } from '@angular/core';

export type Game = {
  id?: string,
  moves: string,
  board: string,
  turn: number,
  whiteTime: number,
  blackTime: number,
  whitePlayerId?: string,
  blackPlayerId?: string,
  whitePlayerUsername: string,
  blackPlayerUsername: string,
  started: boolean,
  ended: boolean,
  winner?: string
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { }
}
