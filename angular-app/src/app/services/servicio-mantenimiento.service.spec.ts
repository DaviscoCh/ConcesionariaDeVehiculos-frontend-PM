import { TestBed } from '@angular/core/testing';

import { ServicioMantenimientoService } from './servicio-mantenimiento.service';

describe('ServicioMantenimientoService', () => {
  let service: ServicioMantenimientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioMantenimientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
