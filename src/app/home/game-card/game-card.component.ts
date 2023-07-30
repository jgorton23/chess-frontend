import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/game/game.service';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements OnInit {

  constructor(private router: Router) { }

  @Input()
  gameInfo!: Game;

  ngOnInit(): void {    
  }

  navigateToGame() {
    this.router.navigate(['play', {id: this.gameInfo?.id}])
  }
}
