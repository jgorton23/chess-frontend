import { Injectable } from '@angular/core';

export type tile = {
  piece: String,
  color: String,
  selected: Boolean,
  possible: Boolean
}

@Injectable({
  providedIn: 'root'
})
export class BoardUtilService {

  constructor() { }

  standard(): tile[][] {
    return [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
    ].map((row, index) => {
      return row.map(
        (s) => {return {piece: s, color: index <= 1 ? 'b' : index >= 6 ? 'w' : '', selected: false, possible: false}}
      )});
  }
}
