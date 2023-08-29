import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BorderTile, Tile } from '../board-util.service';
import { GameService } from 'src/app/shared/api/game.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent {
  
  @Input()
  isIcon: boolean = false

  @Input()
  tile: Tile | BorderTile = {piece: '', selected: false, possible: false};
  
  @Input()
  row = 0
  
  @Input()
  col = 0

  @Output() press: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor(private gameService: GameService) { }

  select() {    
    if (!this.isIcon){
      this.press.emit([this.row, this.col])
    }
  }

  selected(): boolean {
    return 'selected' in this.tile && this.tile.selected
  }

  possible(): boolean {
    return 'possible' in this.tile && this.tile.possible
  }

  piece(): string {
    return 'piece' in this.tile ? this.tile.piece : ''
  }

  rankOrFile(): string {
    if ((this.row === -1 || this.row === 8) && (this.col === -1 || this.col === 8)) {
      return ''
    }
    if (this.col === -1 || this.col === 8) {
      return '' + (Math.abs(8-this.row))
    }
    if (this.row === -1 || this.row === 8) {
      return String.fromCharCode(97+this.col)
    }
    return ''
  }

  isBoardSquare(): boolean {
    return 'piece' in this.tile
  }

  isCheck(): boolean {
    return 'piece' in this.tile && this.tile.piece.toLowerCase() === 'k' && this.gameService.isInCheck(this.tile.piece === 'K' ? 'w' : 'b')
  }

  isLastMove(): boolean {
    let coordinate = '' + String.fromCharCode(97+this.col) + (Math.abs(8-this.row))
    return this.gameService.isInLastMove(coordinate)
  }

}
