import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from "@angular/material";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { BoardComponent } from './board/board.component';
import { TileComponent } from './board/tile/tile.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { SideMenuComponent } from './home/side-menu/side-menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NewGamePopupComponent } from './home/new-game-popup/new-game-popup.component';
import { GameComponent } from './game/game.component';
import { GameCardComponent } from './home/game-card/game-card.component';
import { FriendCardComponent } from './home/side-menu/friend-card/friend-card.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    BoardComponent,
    TileComponent,
    HomeComponent,
    SideMenuComponent,
    NewGamePopupComponent,
    GameComponent,
    GameCardComponent,
    FriendCardComponent,
    NotFoundComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
