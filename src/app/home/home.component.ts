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

  showSideMenu: boolean = true;

  toggleSideMenu(){
    this.showSideMenu = !this.showSideMenu;
  }

  print(msg: String) {
    console.log(msg);
  }

  getPastGames(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Games}`, {credentials: 'include'})
      .then(response => response.json())
      .then(body => {
        this.pastGames = body.games
      });
  }

  createGame(game: Game): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Game}/new`, 
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Accept': "application/json, text/plain, */*",
          'Content-Type': "application/json;charset=utf-8"
        },
        body: JSON.stringify(game)
      }
    )
  }

}
