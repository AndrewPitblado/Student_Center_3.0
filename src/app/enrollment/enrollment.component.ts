import { Component, viewChild } from '@angular/core';

import { CourseData, SessionData } from '../interface/enrollment.interface';

import { startWith, map } from 'rxjs/operators';
import { OnInit } from '@angular/core';
import { CourseDTO } from '../interface/course';
import { CourseSelectorComponent } from '../course-selector/course-selector.component';

import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTableModule,
    CommonModule,
    MatAccordion,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatSelectModule,
    FormsModule,

    ReactiveFormsModule,
    CourseSelectorComponent,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './enrollment.component.html',
  styleUrl: './enrollment.component.css',
})
export class EnrollmentComponent implements OnInit {
  sessionControl = new FormControl<SessionData | null>(
    null,
    Validators.required
  );
  searchControl = new FormControl('');
  courses: CourseData[] = [
    {
      name: 'Introduction to Computer Science',
      courseCode: 'CSC101',
      courseDescription: 'An introduction to computer science.',
      courseCredit: 3,
      coursePrerequisites: [],
    },
    {
      name: 'Advanced Computer Science',
      courseCode: 'CSC201',
      courseDescription: 'An advanced course in computer science.',
      courseCredit: 3,
      coursePrerequisites: ['CSC101'],
    },
    {
      name: 'Introduction to Mathematics',
      courseCode: 'MAT101',
      courseDescription: 'An introduction to mathematics.',
      courseCredit: 3,
      coursePrerequisites: [],
    },
    {
      name: 'Advanced Mathematics',
      courseCode: 'MAT201',
      courseDescription: 'An advanced course in mathematics.',
      courseCredit: 3,
      coursePrerequisites: ['MAT101'],
    },
  ];
  filteredCourses$!: Observable<CourseData[]>;

  ngOnInit() {
    this.filteredCourses$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCourses(value || ''))
    );
  }
  sessionData: SessionData[] = [
    {
      session: 'Fall/Winter Regular Session',
      startTime: 'September 1, 2024: 08:00',
      endTime: 'April 30, 2025, 23:59',
    },
    {
      session: 'Summer Session',
      startTime: 'May 1, 2025: 08:00',
      endTime: 'August 31, 2025, 23:59',
    },
  ];
  displayFn(course: CourseData): string {
    return course ? `${course.courseCode} - ${course.name}` : '';
  }
  private _filterCourses(value: string): CourseData[] {
    const filterValue = value.toLowerCase();
    return this.courses.filter(
      (course) =>
        course.courseCode.toLowerCase().includes(filterValue) ||
        course.name.toLowerCase().includes(filterValue)
    );
  }
  onCourseSelected(course: CourseDTO) {
    console.log('Selected Course:', course);
  }
}
