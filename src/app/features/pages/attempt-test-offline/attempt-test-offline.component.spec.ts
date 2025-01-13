import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptTestOfflineComponent } from './attempt-test-offline.component';

describe('AttemptTestOfflineComponent', () => {
  let component: AttemptTestOfflineComponent;
  let fixture: ComponentFixture<AttemptTestOfflineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptTestOfflineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptTestOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
