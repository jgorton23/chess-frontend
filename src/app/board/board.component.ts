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

  selectedPiece: {x: number, y: number} | null = null;

  select(event: number[]){
    if(this.selectedPiece === null && this.grid[event[0]][event[1]].piece != ''){
      this.grid[event[0]][event[1]].selected = !this.grid[event[0]][event[1]].selected;
      this.selectedPiece = {x: event[1], y: event[0]};
    }else if(this.selectedPiece !== null){
      this.grid[this.selectedPiece.y][this.selectedPiece.x].selected = false;
      if(this.grid[event[0]][event[1]].possible){
        this.grid[event[0]][event[1]].piece = this.grid[this.selectedPiece.y][this.selectedPiece.y].piece;
        this.grid[this.selectedPiece.y][this.selectedPiece.x].piece = '';
      }
      this.selectedPiece = null;
    }
    this.updatePossible();
  }

  updatePossible(){

  }
}
