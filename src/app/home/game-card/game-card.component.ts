import { Component, Input, OnInit } from '@angular/core';
import { Game } from 'src/app/game/game.service';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements OnInit {

  constructor() { }

  @Input()
  gameInfo?: Game;

  ngOnInit(): void {    
  }

}
