import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTestSeriesComponent } from './user-test-series.component';

describe('UserTestSeriesComponent', () => {
  let component: UserTestSeriesComponent;
  let fixture: ComponentFixture<UserTestSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTestSeriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTestSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
