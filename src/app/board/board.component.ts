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

  playerColor = 'b';

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
        break;
      case 'n':
        break;
      case 'b':
        break;
      case 'k':
        break;
      case 'q':
        break;
      default:
        return;
    }
  }
}
