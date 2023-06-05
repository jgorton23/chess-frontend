import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  piece = ""

  @Input()
  row = 0
  
  @Input()
  col = 0
}
