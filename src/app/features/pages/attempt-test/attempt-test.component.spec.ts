import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptTestComponent } from './attempt-test.component';

describe('AttemptTestComponent', () => {
  let component: AttemptTestComponent;
  let fixture: ComponentFixture<AttemptTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
