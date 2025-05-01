import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceCategoriesComponent } from './resource-categories.component';

describe('ResourceCategoriesComponent', () => {
  let component: ResourceCategoriesComponent;
  let fixture: ComponentFixture<ResourceCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
