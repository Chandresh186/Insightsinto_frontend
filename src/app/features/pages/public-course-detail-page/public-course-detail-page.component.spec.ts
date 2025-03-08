import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicCourseDetailPageComponent } from './public-course-detail-page.component';

describe('PublicCourseDetailPageComponent', () => {
  let component: PublicCourseDetailPageComponent;
  let fixture: ComponentFixture<PublicCourseDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicCourseDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicCourseDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
