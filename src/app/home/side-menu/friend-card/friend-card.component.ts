import { Component, Input, OnInit } from '@angular/core';
import { ProfileService, friend } from 'src/app/shared/api/profile.service';

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
  friendInfo?: friend

  rejectFriendRequest(): void {
    this.profileService.removeFriends(this.friendInfo!.username);
  }
  
  approveFriendRequest(): void {
    this.profileService.addFriend(this.friendInfo!.username);
  }

}
