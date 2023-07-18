import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { BoardComponent } from './board/board.component';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game/game.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: 'login', title: 'Chess Login' ,component: LoginComponent},
  { path: 'register', title: 'chess Register', component: RegisterComponent},
  { path: 'home', title: 'Jacob\'s Chess', component: HomeComponent},
  { path: 'board', component: BoardComponent},
  { path: 'play/:gameId', component: GameComponent},
  { path: 'play', component: GameComponent},
  { path: 'notfound', component: NotFoundComponent},
  { path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
