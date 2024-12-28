import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingAndPlansComponent } from './pricing-and-plans.component';

describe('PricingAndPlansComponent', () => {
  let component: PricingAndPlansComponent;
  let fixture: ComponentFixture<PricingAndPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingAndPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingAndPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
