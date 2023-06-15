import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGamePopupComponent } from './new-game-popup.component';

describe('NewGamePopupComponent', () => {
  let component: NewGamePopupComponent;
  let fixture: ComponentFixture<NewGamePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewGamePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewGamePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
