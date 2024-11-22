import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSeriesDetailsComponent } from './test-series-details.component';

describe('TestSeriesDetailsComponent', () => {
  let component: TestSeriesDetailsComponent;
  let fixture: ComponentFixture<TestSeriesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSeriesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSeriesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
