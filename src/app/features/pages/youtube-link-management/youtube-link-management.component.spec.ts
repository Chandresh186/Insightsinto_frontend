import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeLinkManagementComponent } from './youtube-link-management.component';

describe('YoutubeLinkManagementComponent', () => {
  let component: YoutubeLinkManagementComponent;
  let fixture: ComponentFixture<YoutubeLinkManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoutubeLinkManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YoutubeLinkManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
