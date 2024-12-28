import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyEditorialComponent } from './daily-editorial.component';

describe('DailyEditorialComponent', () => {
  let component: DailyEditorialComponent;
  let fixture: ComponentFixture<DailyEditorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyEditorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyEditorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
