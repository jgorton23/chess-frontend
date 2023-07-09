import { ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, KeyValueDiffer, KeyValueDiffers, OnInit, Output } from '@angular/core';
import { BoardComponent } from '../board.component';
import { tile } from '../board-util.service';
import { getLocaleFirstDayOfWeek } from '@angular/common';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent {
  
  @Input()
  tile: tile = {piece: '', selected: false, possible: false};
  
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
