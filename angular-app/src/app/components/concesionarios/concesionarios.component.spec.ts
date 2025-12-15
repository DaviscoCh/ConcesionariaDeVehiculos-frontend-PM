import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcesionariosComponent } from './concesionarios.component';

describe('ConcesionariosComponent', () => {
  let component: ConcesionariosComponent;
  let fixture: ComponentFixture<ConcesionariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConcesionariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConcesionariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
