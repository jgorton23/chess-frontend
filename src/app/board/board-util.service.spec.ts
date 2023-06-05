import { TestBed } from '@angular/core/testing';

import { BoardUtilService } from './board-util.service';

describe('BoardUtilService', () => {
  let service: BoardUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
