import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSelectorComponent } from './course-selector.component';

describe('CourseSelectorComponent', () => {
  let component: CourseSelectorComponent;
  let fixture: ComponentFixture<CourseSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
