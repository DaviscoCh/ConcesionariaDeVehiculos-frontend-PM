import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCitasComponent } from './historial-citas.component';

describe('HistorialComponent', () => {
  let component: HistorialCitasComponent;
  let fixture: ComponentFixture<HistorialCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistorialCitasComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HistorialCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
