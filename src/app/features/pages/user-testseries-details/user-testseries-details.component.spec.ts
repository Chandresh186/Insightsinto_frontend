import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTestseriesDetailsComponent } from './user-testseries-details.component';

describe('UserTestseriesDetailsComponent', () => {
  let component: UserTestseriesDetailsComponent;
  let fixture: ComponentFixture<UserTestseriesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTestseriesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTestseriesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
