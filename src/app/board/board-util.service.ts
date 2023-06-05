import { Injectable } from '@angular/core';

export type tile = {
  piece: String,
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
      ['r', 'n', 'b', 'k', 'q', 'b', 'n', 'r']
    ].map((row) => {
      return row.map(
        (s) => {return {piece: s, selected: false, possible: false}}
      )});
  }
}
