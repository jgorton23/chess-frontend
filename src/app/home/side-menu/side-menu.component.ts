import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ApiPaths } from 'src/app/api-paths';
import { ProfileService } from 'src/app/shared/profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
  animations: [
    trigger('openClose', [
      state('left', style({ transform: 'translateX(-100%)' })),
      state('right', style({ transform: 'translateX(0%)' })),
      transition('left => right', [
        animate(125, style({ transform: 'translateX(0%)' })),
      ]),
      transition('right => left', [
        animate(125, style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ]
})
export class SideMenuComponent implements OnInit {

  constructor(public profileService: ProfileService) { }

  ngOnInit(): void {
    this.profileService.getProfile()
  }

  @Input()
  isOpen: boolean = false;

  newPassword: string = "";

  confirmNewPassword: string = "";

  friendUsername: string = "";

  editingEmail: boolean = false;
  
  editingPassword: boolean = false;

  viewingFriends: boolean = false;

  changeEmail(): void {
    this.editingEmail = !this.editingEmail;
  }

  saveEmail(): void {
    this.profileService.saveProfile({email: this.profileService.email})
    this.editingEmail = false;
  }

  changePassword(): void {
    this.editingPassword = !this.editingPassword;
  }

  savePassword(): void {
    this.profileService.saveProfile({password: this.newPassword, confirm: this.confirmNewPassword})
    this.editingPassword = false;
  }

  viewFriends(): void {
    if (!this.viewingFriends) {
      this.profileService.getFriends()
    }
    this.viewingFriends = !this.viewingFriends;
  }
}
