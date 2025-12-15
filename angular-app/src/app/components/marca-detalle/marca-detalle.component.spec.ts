import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcaDetalleComponent } from './marca-detalle.component';

describe('MarcaDetalleComponent', () => {
  let component: MarcaDetalleComponent;
  let fixture: ComponentFixture<MarcaDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarcaDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
