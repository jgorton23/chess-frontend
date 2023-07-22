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

  @Output() press: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor() { }

  isSelected(){
    return this.tile.selected;
  }

  isPossible(){
    return this.tile.possible;
  }

  select() {
    console.log("Tile select", this.row, this.col);
    this.press.emit([this.row, this.col])
  }
}
