import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../shared/api/game.service';
import { ProfileService, Status } from '../shared/api/profile.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(public gameService: GameService, private profileService: ProfileService) { }

  ngOnInit(): void {
    this.gameService.getGames();
    this.profileService.updateSession(Status.ONLINE, '')
  }

  ngOnDestroy(): void {
    this.profileService.updateSession(Status.OFFLINE, '')
  }

  showSideMenu: boolean = false;

  showPopup: boolean = false;

  toggleSideMenu(){
    this.showSideMenu = !this.showSideMenu;
  }

  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }
}
