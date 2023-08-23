import { Component, Input, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/shared/api/profile.service';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css']
})
export class FriendCardComponent implements OnInit {

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
  }

  @Input()
  pending?: boolean;

  @Input()
  invitation?: boolean;

  @Input()
  username: string = "";

  rejectFriendRequest(): void {
    this.profileService.removeFriends(this.username);
  }
  
  approveFriendRequest(): void {
    this.profileService.addFriend(this.username);
  }

}
