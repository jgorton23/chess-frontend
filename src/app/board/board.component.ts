import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BoardUtilService, BorderTile, Tile, variations } from './board-util.service';

export type Move = {
  startSquare: number[],
  destSquare: number[],
  piece: string,
  promotion?: string,
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

  @Input()
  check: string = '';
  
  @Output()
  moveEmitter: EventEmitter<Move> = new EventEmitter();
  
  grid: Tile[][] = this.boardUtil.FENToTileArr(this.fen)
  
  selectedPiece?: {x: number, y: number};

  ngOnInit(): void {
      console.log("FEN", this.fen);
  }

  expandedGrid(): (Tile | BorderTile)[][] {
    if (this.isIcon) {
      return this.grid
    }
    let firstRow: BorderTile[] = [...[0,1,2,3,4,5,6,7,8,9].map(ind => ({x: ind, y: 0}))];
    let lastRow: BorderTile[] = [...[0,1,2,3,4,5,6,7,8,9].map(ind => ({x: ind, y: 9}))];
    return [
      firstRow,
      ...this.grid.map((row, ind) => [{x: 0, y: ind}, ...row, {x: 9, y: ind}]),
      lastRow]
  }

  isCorner(x: number, y: number): boolean {
    if (x === 0 && y === 0) {
      return true
    }
    if (x === 9 && y === 0) {
      return true
    }
    if (x === 9 && y === 9) {
      return true
    }
    if (x === 0 && y === 9) {
      return true
    }
    return false
  }

  isBorder(x: number, y: number): boolean {
    return (x === 0 || x === 9 || y === 0 || y === 9)
  }

  isLastMove(x: number, y: number): boolean {
    let coordinate = "" + String.fromCharCode(97+x) + Math.abs(y-8)
    return (this.fen.split(" ").at(-1) ?? "").includes(coordinate)
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
        let x = 0
        let y = 0
        if (move.charAt(3) == 'x') {
          x = move.charCodeAt(4) - 97
          y = Math.abs(parseInt(move.charAt(5)) - 8)
        } else {
          x = move.charCodeAt(3) - 97
          y = Math.abs(parseInt(move.charAt(4)) - 8)
        }
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

  isPlayerColor(piece: string, color?: string) {
    color = color || this.playerColor
    return (color === 'w' && this.isWhitePiece(piece)) || (color === 'b' && this.isBlackPiece(piece))
  }

  isKing(playerColor: string, x: number, y: number) {
    return this.grid[y][x].piece.toLowerCase() === 'k' && this.isPlayerColor(this.grid[y][x].piece, playerColor)
  }

}
