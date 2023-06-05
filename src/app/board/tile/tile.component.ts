import { Component, Input, OnInit } from '@angular/core';
import { BoardComponent } from '../board.component';

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
  piece: String = ""

  @Input()
  row = 0
  
  @Input()
  col = 0

  @Input() parent: BoardComponent | null = null;

  isSelected(){
    return this.parent!.isSelected(this.col, this.row);
  }

  select(){

  }
}
