import { Component, EventEmitter, OnInit } from '@angular/core';
import { BoardUtilService, tile } from './board-util.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  constructor(private boardUtil: BoardUtilService) { }

  ngOnInit(): void {
  }

  grid: tile[][] = this.boardUtil.standard();
    

  isSelected(x: number, y: number){
    return this.grid[y][x].selected;
  }

  select(event: number[]){
    console.log(event);
  }
}
