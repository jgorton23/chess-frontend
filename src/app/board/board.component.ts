import { Component, OnInit } from '@angular/core';
import { BoardUtilService } from './board-util.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  constructor(private boardUtil: BoardUtilService) { }

  ngOnInit(): void {
  }

  grid = this.boardUtil.standard();
    

  isSelected(x: number, y: number){
    return x === 2 && (y === 2 || y === 1);
  }

  get isSelectedFunc(){
    return this.isSelected.bind(this);
  }
}
