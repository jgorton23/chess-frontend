import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  isOpen: boolean = false;
}
