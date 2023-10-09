import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game, GameService } from 'src/app/shared/api/game.service';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements OnInit {

  constructor(private router: Router, private gameService: GameService) { }

  @Input()
  gameInfo!: Game;

  ngOnInit(): void {}

  navigateToGame() {
    this.gameService.setCurrentGame(this.gameInfo)
    this.router.navigate(['play', {id: this.gameInfo?.id}])
  }
}
