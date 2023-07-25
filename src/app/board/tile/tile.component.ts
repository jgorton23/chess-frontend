import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tile } from '../board-util.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent {
  
  @Input()
  tile: Tile = {piece: '', selected: false, possible: false};
  
  @Input()
  row = 0
  
  @Input()
  col = 0

  @Input()
  rank = ''

  @Input()
  file = ''

  @Output() press: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor() { }

  select() {
    this.press.emit([this.row, this.col])
  }
}
