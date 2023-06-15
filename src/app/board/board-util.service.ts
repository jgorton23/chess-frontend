import { Injectable } from '@angular/core';

export type tile = {
  piece: String,
  selected: Boolean,
  possible: Boolean
}

export enum variations {
  Standard = 'standard',
}

@Injectable({
  providedIn: 'root'
})
export class BoardUtilService {

  constructor() { }

  standard(): tile[][] {
    var FEN = this.getBoard(variations.Standard);
    [...Array(9).keys()].forEach(x => FEN=FEN.replace(new RegExp(String(x), "g"), " ".repeat(x)))
    // console.log(FEN)
    var board = FEN.split("/").map(row => row.split(""));
    return board.map((row) => {
      return row.map(
        (s) => {return {piece: s, selected: false, possible: false}}
      )});
  }

  getBoard(variation: String): String {
    switch(variation){
      case variations.Standard:
        return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
      default:
        return ""
    }
  }

  getVariations(): String[] {
    return ["standard"]
  }
}
