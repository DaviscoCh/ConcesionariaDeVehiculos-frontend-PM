import { TestBed } from '@angular/core/testing';

import { RepuestoService } from './repuesto.service';

describe('RepuestoService', () => {
  let service: RepuestoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepuestoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
