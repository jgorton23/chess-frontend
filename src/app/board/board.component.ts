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
    var x = event[1];
    var y = event[0];
    if(this.selectedPiece === null && this.grid[y][x].piece != ''){
      this.grid[y][x].selected = true;
      this.selectedPiece = {x: x, y: y};
    }else if(this.selectedPiece !== null){
      this.grid[this.selectedPiece.y][this.selectedPiece.x].selected = false;
      if(this.grid[y][x].possible){
        // console.log(this.grid[this.selectedPiece.y][this.selectedPiece.x]);
        // console.log(this.selectedPiece.x,this.selectedPiece.y,"=>",x,y);
        this.grid[y][x].piece = this.grid[this.selectedPiece.y][this.selectedPiece.x].piece;
        this.grid[this.selectedPiece.y][this.selectedPiece.x].piece = '';
        // console.log(this.grid[y][x]);
      }
      this.selectedPiece = null;
    }
    this.updatePossible();
  }

  updatePossible(){
    for(let x = 0; x < this.grid[0].length; x++){
      for(let y = 0; y < this.grid.length; y++){
        if(this.selectedPiece === null){
          this.grid[y][x].possible = false;
        }else{
          if(this.reachable(this.selectedPiece.x, this.selectedPiece.y, x, y)){
            this.grid[y][x].possible = true;
          }
        }
      }
    }
  }

  reachable(x1: number, y1: number, x2: number, y2: number){
    if(x1 === x2 && y1 === y2){
      return false;
    }

    var type = this.grid[y1][x1].piece
    var canReach = true;
    switch(type){
      case 'p':

        break;
    }
    return canReach;
  }
}
