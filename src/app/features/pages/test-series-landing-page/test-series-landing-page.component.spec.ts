import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSeriesLandingPageComponent } from './test-series-landing-page.component';

describe('TestSeriesLandingPageComponent', () => {
  let component: TestSeriesLandingPageComponent;
  let fixture: ComponentFixture<TestSeriesLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSeriesLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSeriesLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
