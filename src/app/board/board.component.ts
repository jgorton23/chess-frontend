import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BoardUtilService, tile } from './board-util.service';
import { Game } from '../game/game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  constructor(private boardUtil: BoardUtilService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log("init")
  }

  @Input()
  grid: tile[][] = this.boardUtil.standard()
  
  @Input()
  playerColor: string = 'w';

  @Output()
  moveEmitter: EventEmitter<any> = new EventEmitter();

  selectedPiece?: {x: number, y: number};

  select(event: number[]){
    var x = event[1];
    var y = event[0];
    if (this.playerColor === '') {
      return
    }
    if(this.selectedPiece === undefined && this.isPlayerColor(this.grid[y][x].piece)){
      this.grid[y][x].selected = true;
      this.selectedPiece = {x: x, y: y};
    }else if(this.selectedPiece !== undefined){
      this.grid[this.selectedPiece.y][this.selectedPiece.x].selected = false;
      if(this.grid[y][x].possible){
        this.grid[y][x].piece = this.grid[this.selectedPiece.y][this.selectedPiece.x].piece;
        this.grid[this.selectedPiece.y][this.selectedPiece.x].piece = ' ';
        this.playerColor = this.playerColor === 'w' ? 'b' : 'w';
        this.moveEmitter.emit(null)
      }else if(this.isPlayerColor(this.grid[y][x].piece)){
        this.selectedPiece = {x: x, y: y};
        this.grid[y][x].selected = true;
      }else{
        this.selectedPiece = undefined;
      }
    }
    if(this.selectedPiece){
      console.log(this.grid[this.selectedPiece.y][this.selectedPiece.x]);
    }
    
    this.updatePossible();
    // this.changeDetector.detectChanges()
  }

  updatePossible(){
    for(let x = 0; x < this.grid[0].length; x++){
      for(let y = 0; y < this.grid.length; y++){
        this.grid[y][x].possible = false;
      }
    }
    if(this.selectedPiece){
      this.findReachable(this.selectedPiece.x, this.selectedPiece.y);
    }
  }

  findReachable(x: number, y: number){
    console.log("searching");
    
    switch(this.grid[y][x].piece){
      case 'p':
      case 'P':
        var increment;
        if(this.isWhitePiece(this.grid[y][x].piece)){
          increment = -1;
        }else{
          increment = 1;
        }
        if(this.isEmptySquare(this.grid[y+increment][x].piece)){
          this.grid[y+increment][x].possible = true;
          if(((y === 6 && this.isWhitePiece(this.grid[y][x].piece)) || (y === 1 && this.isBlackPiece(this.grid[y][x].piece))) && this.isEmptySquare(this.grid[y+(2*increment)][x].piece)){
            this.grid[y+(2*increment)][x].possible = true;
          }
        }
        if(x < 7 && !this.isEmptySquare(this.grid[y+increment][x+1].piece) && !this.areSameColor(this.grid[y+increment][x+1].piece, this.grid[y+increment][x].piece)){
          this.grid[y+increment][x+1].possible = true;
        }
        if(x > 0 && !this.isEmptySquare(this.grid[y+increment][x-1].piece) && !this.areSameColor(this.grid[y+increment][x-1].piece, this.grid[y+increment][x].piece)){
          this.grid[y+increment][x-1].possible = true;
        }
        break;
      case 'r':
      case 'R':
        this.searchStraight(x, y);
        break;
      case 'n':
      case 'N':
        var possibilities = [[-2,1], [-2,-1], [-1,2], [-1,-2]]
        for(let possibility of possibilities){
          if(this.isInBounds(x+possibility[0], y+possibility[1])){
            if(!this.areSameColor(this.grid[y+possibility[1]][x+possibility[0]].piece, this.grid[y][x].piece)){
              this.grid[y+possibility[1]][x+possibility[0]].possible = true;
            }
          }
          if(this.isInBounds(x-possibility[0], y-possibility[1])){
            if(!this.areSameColor(this.grid[y-possibility[1]][x-possibility[0]].piece, this.grid[y][x].piece)){
              this.grid[y-possibility[1]][x-possibility[0]].possible = true;
            }
          }
        }
        break;
      case 'b':
      case 'B':
        this.searchDiagonal(x, y);
        break;
      case 'k':
      case 'K':
        for(var i = Math.max(0, y-1); i <= Math.min(y+1, this.grid.length-1); i++){
          for(var j = Math.max(0, x-1); j <= Math.min(x+1, this.grid[0].length-1); j++){
            if(i !== y || j !== x){
              if(!this.areSameColor(this.grid[i][j].piece, this.grid[y][x].piece)){
                this.grid[i][j].possible = true;
              }
            }
          }
        }
        break;
      case 'q':
      case 'Q':
        this.searchDiagonal(x, y);
        this.searchStraight(x, y);
        break;
      default:
        return;
    }
    console.log(this.grid[5][0].possible);
    
  }

  searchDiagonal(x: number, y: number){
    var lu = 1, ru = 1, ld = 1, rd = 1
    var origin = this.grid[y][x].piece

    while (lu || ru || ld || rd) {
      if (lu &&= (this.isInBounds(x-lu, y-lu) && !this.areSameColor(this.grid[y-lu][x-lu].piece, origin))?lu:0) {
        this.grid[y-lu][x-lu].possible = true;
        lu &&= this.isEmptySquare(this.grid[y-lu][x-lu].piece)?lu+1:0
      }
      if (ru &&= (this.isInBounds(x+ru, y-ru) && !this.areSameColor(this.grid[y-ru][x+ru].piece, origin))?ru:0) {
        this.grid[y-ru][x+ru].possible = true;
        ru &&= this.isEmptySquare(this.grid[y-ru][x+ru].piece)?ru+1:0
      }
      if (ld &&= (this.isInBounds(x-ld, y+ld) && !this.areSameColor(this.grid[y+ld][x-ld].piece, origin))?ld:0) {
        this.grid[y+ld][x-ld].possible = true;
        ld &&= this.isEmptySquare(this.grid[y+ld][x-ld].piece)?ld+1:0
      }
      if (rd &&= (this.isInBounds(x+rd, y+rd) && !this.areSameColor(this.grid[y+rd][x+rd].piece, origin))?rd:0) {
        this.grid[y+rd][x+rd].possible = true;
        rd &&= this.isEmptySquare(this.grid[y+rd][x+rd].piece)?rd+1:0
      }
    }
  }

  searchStraight(x: number, y: number){
    var left = 1
    var right = 1;
    var up = 1;
    var down = 1;
    var origin = this.grid[y][x].piece
    
    while(left || right || up || down){
      if(left &&= (this.isInBounds(x-left, y) && !this.areSameColor(this.grid[y][x-left].piece, origin))?left:0){
        this.grid[y][x-left].possible = true;
        left &&= this.isEmptySquare(this.grid[y][x-left].piece)?left+1:0
      }
      if(right &&= (this.isInBounds(x+right, y) && !this.areSameColor(this.grid[y][x+right].piece, origin))?right:0) {
        this.grid[y][x+right].possible = true;
        right &&= this.isEmptySquare(this.grid[y][x+right].piece)?right+1:0
      }
      if (up &&= (this.isInBounds(x, y-up) && !this.areSameColor(this.grid[y-up][x].piece, origin))?up:0) {
        this.grid[y-up][x].possible = true;
        up &&= this.isEmptySquare(this.grid[y-up][x].piece)?up+1:0
      }
      if (down &&= (this.isInBounds(x, y+down) && !this.areSameColor(this.grid[y+down][x].piece, origin))?down:0){
        this.grid[y+down][x].possible = true;
        down &&= this.isEmptySquare(this.grid[y+down][x].piece)?down+1:0
      }
    }
  }

  isInBounds(x: number,y: number){
    return 0 <= x && 0 <= y && x < this.grid[0].length && y < this.grid.length;
  }

  isWhitePiece(c: string){
    return "PQKBNR".indexOf(c) >= 0
  }

  isBlackPiece(c: string){
    return "pqkbnr".indexOf(c) >= 0
  }

  areSameColor(c1: string, c2: string) {            
    return ("PQKBNR".indexOf(c1) >= 0 && "PQKBNR".indexOf(c2) >= 0) || ("pqkbnr".indexOf(c1) >= 0 && "pqkbnr".indexOf(c2) >= 0)
  }

  isEmptySquare(c: string) {
    return c === ' ';
  }

  isPlayerColor(c: string) {
    return (this.playerColor === 'w' && this.isWhitePiece(c)) || (this.playerColor === 'b' && this.isBlackPiece(c))
  }
}
