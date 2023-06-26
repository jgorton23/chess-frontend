import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css']
})
export class FriendCardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  pending?: boolean;

  @Input()
  invitation?: boolean;

  @Input()
  username: string = "";

  

}
