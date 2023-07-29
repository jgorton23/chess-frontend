import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BoardUtilService, Tile, variations } from './board-util.service';

export type Move = {
  startSquare: number[],
  destSquare: number[],
  piece: string,
  isCheck: boolean,
  isMate: boolean,
  isCapture: boolean,
  miliseconds?: number
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnChanges {

  constructor(private boardUtil: BoardUtilService) { }

  @Input()
  isIcon: boolean = false

  @Input()
  fen: string = this.boardUtil.getBoard(variations.Standard);
  
  @Input()
  playerColor: string = ' ';

  @Input()
  currentPlayer: string = 'w';

  @Input()
  validMoves: string[] = [];
  
  @Output()
  moveEmitter: EventEmitter<Move> = new EventEmitter();
  
  grid: Tile[][] = this.boardUtil.FENToTileArr(this.fen)
  
  selectedPiece?: {x: number, y: number};

  ngOnInit(): void {
      console.log("FEN", this.fen);
  }

  abs(n: number) {
    return Math.abs(n)
  }

  char(n: number) {
    return String.fromCharCode(n+97)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fen']) {
      let newGrid = this.boardUtil.FENToTileArr(this.fen)
      if (!newGrid || newGrid.length < this.grid.length) {
        return
      }
      for(let y = 0; y < this.grid.length; y++){
        for(let x = 0; x < this.grid[0].length; x++){
          this.grid[y][x].possible = false;
          this.grid[y][x].selected = false;
          this.grid[y][x].piece = newGrid[y][x].piece
        }
      }
    }    
  }

  select(event: number[]){    
    var x = event[1];
    var y = event[0];
    if (this.playerColor === '' || (this.currentPlayer !== this.playerColor)) {
      return
    }
    if(this.selectedPiece === undefined && this.isPlayerColor(this.grid[y][x].piece)){
      this.selectedPiece = {x: x, y: y};
      this.grid[y][x].selected = true
    }else if(this.selectedPiece !== undefined){
      this.grid[this.selectedPiece.y][this.selectedPiece.x].selected = false;
      if(this.grid[y][x].possible){
        // this.grid[y][x].piece = this.grid[this.selectedPiece.y][this.selectedPiece.x].piece;
        // this.grid[this.selectedPiece.y][this.selectedPiece.x].piece = ' ';
        let move = {
          startSquare: [this.selectedPiece.x, this.selectedPiece.y],
          destSquare: [x, y],
          isCapture: false,
          isCheck: false,
          isMate: false,
          piece: this.grid[this.selectedPiece.y][this.selectedPiece.x].piece
        }
        this.moveEmitter.emit(move)
      }else if(this.isPlayerColor(this.grid[y][x].piece)){
        this.selectedPiece = {x: x, y: y};
        this.grid[y][x].selected = true;
      }else{
        this.selectedPiece = undefined;
      }
    }
    this.updatePossible();
  }

  updatePossible(){
    for(let x = 0; x < this.grid[0].length; x++){
      for(let y = 0; y < this.grid.length; y++){
        this.grid[y][x].possible = false;
      }
    }
    if(this.selectedPiece){
      let start = this.grid[this.selectedPiece.y][this.selectedPiece.x].piece + String.fromCharCode(97+this.selectedPiece.x) + Math.abs(this.selectedPiece.y-8)
      this.validMoves.filter(move => move.startsWith(start)).forEach(move => {        
        if (move.length < 5) {
          return
        }
        let x = move.charCodeAt(3) - 97
        let y = Math.abs(parseInt(move.charAt(4)) - 8)
        this.grid[y][x].possible = true;
      })
    }
  }

  isWhitePiece(c: string){
    return "PQKBNR".indexOf(c) >= 0
  }

  isBlackPiece(c: string){
    return "pqkbnr".indexOf(c) >= 0
  }

  isPlayerColor(c: string) {
    return (this.playerColor === 'w' && this.isWhitePiece(c)) || (this.playerColor === 'b' && this.isBlackPiece(c))
  }
}
