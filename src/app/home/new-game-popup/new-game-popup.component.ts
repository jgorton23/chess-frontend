import { Component, OnInit } from '@angular/core';
import { ApiPaths } from 'src/app/api-paths';
import { BoardUtilService } from 'src/app/board/board-util.service';
import { Game } from 'src/app/game/game.service';
import { ProfileService } from 'src/app/shared/profile.service';
import { environment } from 'src/environments/environment';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-new-game-popup',
  templateUrl: './new-game-popup.component.html',
  styleUrls: ['./new-game-popup.component.css'],
})
export class NewGamePopupComponent implements OnInit{
  constructor(private boardUtil: BoardUtilService, private profileService: ProfileService) {}

  friends: string[] = []

  opponent: string = "Select Opponent"

  ngOnInit(): void {
    this.getFriends();
  }

  getFriends(): void {
    fetch(`${environment.baseUrl}/${ApiPaths.Friends}`, {credentials: 'include'})
      .then(response => response.json())
      .then(body => {
        this.friends = body.friends.map((friend: {username: string, friends: number, email: string}) => friend.username)        
      })      
  }

  getModes(){
    return this.boardUtil.getVariations();
  }

  createGame(options: {opponent: string, variant?: string}): void {    
    let game: Game = {
      board: this.boardUtil.getBoard("standard"),
      moves: "",
      turn: 0,
      whiteTime: 600,
      blackTime: 600,
      whitePlayerUsername: this.profileService.getUsername(),
      blackPlayerUsername: this.opponent,
      started: false,
      ended: false,
    }
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