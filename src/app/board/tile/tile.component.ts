import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BoardComponent } from '../board.component';
import { tile } from '../board-util.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

  }

  @Input()
  tile: tile = {piece: "", selected: false};

  @Input()
  row = 0
  
  @Input()
  col = 0

  @Output() press: EventEmitter<number[]> = new EventEmitter<number[]>();

  isSelected(){
    return this.tile.selected;
  }
}
