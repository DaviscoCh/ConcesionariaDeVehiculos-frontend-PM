import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutRepuestosComponent } from './checkout-repuestos.component';

describe('CheckoutRepuestosComponent', () => {
  let component: CheckoutRepuestosComponent;
  let fixture: ComponentFixture<CheckoutRepuestosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutRepuestosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutRepuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
