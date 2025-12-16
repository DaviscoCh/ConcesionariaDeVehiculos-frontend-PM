import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosMantenimientoComponent } from './servicios-mantenimiento.component';

describe('ServiciosMantenimientoComponent', () => {
  let component: ServiciosMantenimientoComponent;
  let fixture: ComponentFixture<ServiciosMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiciosMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
