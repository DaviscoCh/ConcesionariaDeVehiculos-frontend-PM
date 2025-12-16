import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisOrdenesServicioComponent } from './mis-ordenes-servicio.component';

describe('MisOrdenesServicioComponent', () => {
  let component: MisOrdenesServicioComponent;
  let fixture: ComponentFixture<MisOrdenesServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisOrdenesServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisOrdenesServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
