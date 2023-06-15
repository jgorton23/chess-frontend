import { Component } from '@angular/core';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-new-game-popup',
  templateUrl: './new-game-popup.component.html',
  styleUrls: ['./new-game-popup.component.css'],
})
export class NewGamePopupComponent {
  constructor() {}

}