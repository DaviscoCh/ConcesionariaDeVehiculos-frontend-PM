import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaRepuestoComponent } from './factura-repuesto.component';

describe('FacturaRepuestoComponent', () => {
  let component: FacturaRepuestoComponent;
  let fixture: ComponentFixture<FacturaRepuestoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FacturaRepuestoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturaRepuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
