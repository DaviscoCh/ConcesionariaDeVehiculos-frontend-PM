import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculosDetalleComponent } from './vehiculos-detalle.component';

describe('VehiculosDetalleComponent', () => {
  let component: VehiculosDetalleComponent;
  let fixture: ComponentFixture<VehiculosDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehiculosDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculosDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
