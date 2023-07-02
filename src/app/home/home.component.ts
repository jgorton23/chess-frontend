import { Component, OnInit } from '@angular/core';
import { GameService } from '../game/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.getGames();
  }

  showSideMenu: boolean = false;

  showPopup: boolean = false;

  toggleSideMenu(){
    this.showSideMenu = !this.showSideMenu;
  }

  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  print(msg: string) {
    console.log(msg);
  }
}
