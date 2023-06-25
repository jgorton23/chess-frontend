import { Component, OnInit } from '@angular/core';
import { Game } from '../game/game.service';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../api-paths';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.getPastGames();
  }

  pastGames: Game[] = [];

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

  getPastGames(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Games}`, {credentials: 'include'})
      .then(response => response.json())
      .then(body => {
        this.pastGames = body.games
        console.log(this.pastGames);
      });
  }
}
