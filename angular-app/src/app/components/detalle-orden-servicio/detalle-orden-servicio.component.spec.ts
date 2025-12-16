import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleOrdenServicioComponent } from './detalle-orden-servicio.component';

describe('DetalleOrdenServicioComponent', () => {
  let component: DetalleOrdenServicioComponent;
  let fixture: ComponentFixture<DetalleOrdenServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleOrdenServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleOrdenServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
