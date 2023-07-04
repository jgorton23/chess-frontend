import { ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, KeyValueDiffer, KeyValueDiffers, OnInit, Output } from '@angular/core';
import { BoardComponent } from '../board.component';
import { tile } from '../board-util.service';
import { getLocaleFirstDayOfWeek } from '@angular/common';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {
  
  @Input()
  tile: tile = {piece: '', selected: false, possible: false};
  
  @Input()
  row = 0
  
  @Input()
  col = 0

  @Output() press: EventEmitter<number[]> = new EventEmitter<number[]>();

  differ?: KeyValueDiffer<any, any>

  constructor(private changeDetector: ChangeDetectorRef, private kvDiffers: KeyValueDiffers) { }

  ngOnInit(): void {
    this.differ = this.kvDiffers.find(this.tile).create()
  }

  ngDoCheck(): void {
    
    let changes = this.differ?.diff(this.tile)
    if (changes) {
      this.differ = this.kvDiffers.find(this.tile).create()
      // console.log(this.tile);
    }
  }

  isSelected(){
    return this.tile.selected;
  }

  isPossible(){
    return this.tile.possible;
  }

  print(msg: string | boolean) {
    console.log("selected", msg);
    
  }
}
