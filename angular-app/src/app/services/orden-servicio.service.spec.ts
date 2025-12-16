import { TestBed } from '@angular/core/testing';

import { OrdenServicioService } from './orden-servicio.service';

describe('OrdenServicioService', () => {
  let service: OrdenServicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdenServicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
