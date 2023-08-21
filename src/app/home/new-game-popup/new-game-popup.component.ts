import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiPaths } from 'src/app/api-paths';
import { BoardUtilService } from 'src/app/board/board-util.service';
import { Game, GameService } from 'src/app/game/game.service';
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
  constructor(
    private boardUtil: BoardUtilService,
    private profileService: ProfileService,
    private gameService: GameService) {}

  friends: string[] = []

  opponent: string = "Select Opponent"

  @Output()
  closePopup$ = new EventEmitter<boolean>();

  ngOnInit(): void {
    console.log("popup");
    this.getFriends();
  }

  closePopup() {
    this.closePopup$.emit(true)
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

  async createGame(options: {opponent: string, variant?: string}): Promise<void> {
    let game: Game = {
      date: new Date(),
      fen: this.boardUtil.getBoard("standard"),
      moves: "",
      moveTimes: "",
      timeControl: "10/0",
      result: "*",
      whitePlayerUsername: await this.profileService.getUsername(),
      blackPlayerUsername: this.opponent
    }
    
    this.gameService.createGame(game)
  }
}