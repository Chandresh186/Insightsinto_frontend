import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyEditorialLandingPageComponent } from './daily-editorial-landing-page.component';

describe('DailyEditorialLandingPageComponent', () => {
  let component: DailyEditorialLandingPageComponent;
  let fixture: ComponentFixture<DailyEditorialLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyEditorialLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyEditorialLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
