import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAnalysisComponent } from './view-analysis.component';

describe('ViewAnalysisComponent', () => {
  let component: ViewAnalysisComponent;
  let fixture: ComponentFixture<ViewAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
