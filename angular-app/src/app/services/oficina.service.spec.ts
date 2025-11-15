import { TestBed } from '@angular/core/testing';

import { OficinaService } from './oficina.service';

describe('OficinaService', () => {
  let service: OficinaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OficinaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
