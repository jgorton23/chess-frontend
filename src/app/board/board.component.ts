import { Component, EventEmitter, OnInit } from '@angular/core';
import { BoardUtilService, tile } from './board-util.service';
import { MatDialogRef } from '@angular/material';

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

  playerColor = 'w';

  select(event: number[]){
    var x = event[1];
    var y = event[0];
    if(this.selectedPiece === null && this.grid[y][x].color === this.playerColor){
      this.grid[y][x].selected = true;
      this.selectedPiece = {x: x, y: y};
    }else if(this.selectedPiece !== null){
      this.grid[this.selectedPiece.y][this.selectedPiece.x].selected = false;
      if(this.grid[y][x].possible){
        this.grid[y][x].piece = this.grid[this.selectedPiece.y][this.selectedPiece.x].piece;
        this.grid[y][x].color = this.grid[this.selectedPiece.y][this.selectedPiece.x].color;
        this.grid[this.selectedPiece.y][this.selectedPiece.x].piece = '';
        this.grid[this.selectedPiece.y][this.selectedPiece.x].color = '';
        this.playerColor = this.playerColor === 'w' ? 'b' : 'w';
      }else if(this.grid[y][x].color === this.playerColor){
        this.selectedPiece = {x: x, y: y};
        this.grid[y][x].selected = true;
      }else{
        this.selectedPiece = null;
      }
    }
    if(this.selectedPiece){
      console.log(this.grid[this.selectedPiece.y][this.selectedPiece.x]);
    }
    
    this.updatePossible();
  }

  updatePossible(){
    for(let x = 0; x < this.grid[0].length; x++){
      for(let y = 0; y < this.grid.length; y++){
        this.grid[y][x].possible = false;
      }
    }
    if(this.selectedPiece !== null){
      this.findReachable(this.selectedPiece.x, this.selectedPiece.y);
    }
  }

  findReachable(x: number, y: number){
    switch(this.grid[y][x].piece){
      case 'p':
        var increment;
        if(this.grid[y][x].color === 'w'){
          increment = -1;
        }else{
          increment = 1;
        }
        if(this.grid[y+increment][x].piece === ''){
          this.grid[y+increment][x].possible = true;
          if(((y === 6 && this.grid[y][x].color === 'w') || (y === 1 && this.grid[y][x].color === 'b')) && this.grid[y+(2*increment)][x].piece === ''){
            this.grid[y+(2*increment)][x].possible = true;
          }
        }
        if(this.grid[y][x].color === 'w'){
          if(x < 7 && this.grid[y+increment][x+1].color === 'b'){
            this.grid[y+increment][x+1].possible = true;
          }
          if(x > 0 && this.grid[y+increment][x-1].color === 'b'){
            this.grid[y+increment][x-1].possible = true;
          }
        }
        if(this.grid[y][x].color === 'b'){
          if(x < 7 && this.grid[y+increment][x+1].color === 'w'){
            this.grid[y+increment][x+1].possible = true;
          }
          if(x > 0 && this.grid[y+increment][x-1].color === 'w'){
            this.grid[y+increment][x-1].possible = true;
          }
        }
        break;
      case 'r':
        this.searchStraight(x, y);
        break;
      case 'n':
        var possibilities = [[-2,1], [-2,-1], [-1,2], [-1,-2]]
        for(let possibility of possibilities){
          if(this.isInBounds(x+possibility[0], y+possibility[1])){
            if(this.grid[y+possibility[1]][x+possibility[0]].color !== this.grid[y][x].color){
              this.grid[y+possibility[1]][x+possibility[0]].possible = true;
            }
          }
          if(this.isInBounds(x-possibility[0], y-possibility[1])){
            if(this.grid[y-possibility[1]][x-possibility[0]].color !== this.grid[y][x].color){
              this.grid[y-possibility[1]][x-possibility[0]].possible = true;
            }
          }
        }
        break;
      case 'b':
        this.searchDiagonal(x, y);
        break;
      case 'k':
        for(var i = Math.max(0, y-1); i <= Math.min(y+1, this.grid.length-1); i++){
          for(var j = Math.max(0, x-1); j <= Math.min(x+1, this.grid[0].length-1); j++){
            if(i !== y || j !== x){
              if(this.grid[i][j].color !== this.grid[y][x].color){
                this.grid[i][j].possible = true;
              }
            }
          }
        }
        break;
      case 'q':
        this.searchDiagonal(x, y);
        this.searchStraight(x, y);
        break;
      default:
        return;
    }
  }

  searchDiagonal(x: number, y: number){
    for(var j = 1; y+j < this.grid.length && x+j < this.grid[0].length; j++){
      if(this.grid[y+j][x+j].color === this.grid[y][x].color){
        break;
      }
      this.grid[y+j][x+j].possible = true;
      if(this.grid[y+j][x+j].color !== ''){
        break;
      }
    }
    for(var j = 1; y-j >= 0 && x+j < this.grid[0].length; j++){
      if(this.grid[y-j][x+j].color === this.grid[y][x].color){
        break;
      }
      this.grid[y-j][x+j].possible = true;
      if(this.grid[y-j][x+j].color !== ''){
        break;
      }
    }
    for(var j = 1; y-j >= 0 && x-j >= 0; j++){
      if(this.grid[y-j][x-j].color === this.grid[y][x].color){
        break;
      }
      this.grid[y-j][x-j].possible = true;
      if(this.grid[y-j][x-j].color !== ''){
        break;
      }
    }
    for(var j = 1; y+j < this.grid.length && x-j >= 0; j++){
      if(this.grid[y+j][x-j].color === this.grid[y][x].color){
        break;
      }
      this.grid[y+j][x-j].possible = true;
      if(this.grid[y+j][x-j].color !== ''){
        break;
      }
    }
  }

  searchStraight(x: number, y: number){
    // down
    for(var j = 1; j+y < this.grid.length; j++){
      // if the rook is blocked by its own piece
      if(this.grid[y+j][x].color === this.grid[y][x].color){
        break;
      }
      // if the rook can move here mark it possible
      this.grid[y+j][x].possible = true;
      // if the rook can capture a piece, it can't move further
      if(this.grid[y+j][x].color !== ''){
        break;
      }
    }
    // up
    for(var j = 1; y-j >= 0; j++){
      if(this.grid[y-j][x].color === this.grid[y][x].color){
        break;
      }
      this.grid[y-j][x].possible = true;
      if(this.grid[y-j][x].color !== ''){
        break;
      }
    }
    // left
    for(var j = 1; x-j >= 0; j++){
      if(this.grid[y][x-j].color === this.grid[y][x].color){
        break;
      }
      this.grid[y][x-j].possible = true;
      if(this.grid[y][x-j].color !== ''){
        break;
      }
    }
    // right
    for(var j = 1; x+j < this.grid[0].length; j++){
      if(this.grid[y][x+j].color === this.grid[y][x].color){
        break;
      }
      this.grid[y][x+j].possible = true;
      if(this.grid[y][x+j].color !== ''){
        break;
      }
    }
  }

  isInBounds(x: number,y: number){
    return 0 <= x && 0 <= y && x < this.grid[0].length && y < this.grid.length;
  }
}
