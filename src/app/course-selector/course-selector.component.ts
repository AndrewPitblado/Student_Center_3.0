// course-selector.component.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  viewChild,
} from '@angular/core';
import { courseService } from '../services/course.service';
import { CourseDTO } from '../interface/course';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { HostListener } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MatButton } from '@angular/material/button';
import { OnDestroy } from '@angular/core';
import { Subject, filter, fromEvent } from 'rxjs';

@Component({
  selector: 'app-course-selector',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButton,
  ],
  templateUrl: './course-selector.component.html',
  styleUrls: ['./course-selector.component.scss'],
})
export class CourseSelectorComponent implements OnInit, OnDestroy {
  private clickOutside$ = new Subject<void>();
  @Output() courseSelected = new EventEmitter<CourseDTO>();
  @ViewChild('courseDropdown')
  courseInput!: ElementRef;

  courseDropdown!: ElementRef;

  courses: CourseDTO[] = [];
  filteredCourses: CourseDTO[] = [];
  searchControl = new FormControl('');
  selectedFilter = 'all';
  isDropdownOpen = false;
  isLoading = false;
  error: string | null = null;
  selectedCourseDisplay: string = '';
  selectedCourse!: CourseDTO;

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   if (
  //     this.courseDropdown &&
  //     this.courseInput &&
  //     !this.courseDropdown.nativeElement.contains(event.target as Node) &&
  //     !this.courseInput.nativeElement.contains(event.target as Node)
  //   ) {
  //     this.isDropdownOpen = false;
  //   }
  // }
  constructor(
    private courseService: courseService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCourses();

    // Set up search with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.filterCourses(term || '');
      });
    this.clickOutside$
      .pipe(
        debounceTime(200),
        filter(() => this.isDropdownOpen)
      )
      .subscribe(() => {
        this.isDropdownOpen = false;
      });
    // fromEvent<MouseEvent>(document, 'click')
    //   .pipe(

    //     filter((event: MouseEvent) => {

    //       // Add null checks
    //       const isOutsideCourseInput =
    //         !this.courseInput ||
    //         !this.courseInput.nativeElement.contains(event.target);

    //       const isOutsideCourseDropdown =
    //         !this.courseDropdown ||
    //         !this.courseDropdown.nativeElement.contains(event.target);

    //       return isOutsideCourseInput && isOutsideCourseDropdown;
    //     })
    //   )
    //   .subscribe(() => {
    //     this.isDropdownOpen = false;
    //   });
  }
  ngOnDestroy(): void {
    this.clickOutside$.complete();
  }

  loadCourses() {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filteredCourses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load courses. Please try again.';
        this.isLoading = false;
        return error;
      },
    });
  }

  filterCourses(searchTerm: string) {
    let filtered = [...this.courses];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.courseName.toLowerCase().includes(term) ||
          course.courseAlias.toLowerCase().includes(term) ||
          course.courseSuffix.toLowerCase().includes(term)
      );
    }

    // Apply dropdown filter
    switch (this.selectedFilter) {
      case 'available':
        filtered = filtered.filter(
          (course) => course.numEnrolled < course.totalSeats
        );
        break;
      case 'current':
        const today = new Date();
        filtered = filtered.filter(
          (course) =>
            new Date(course.startDate) <= today &&
            new Date(course.endDate) >= today
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(
          (course) => new Date(course.startDate) > new Date()
        );
        break;
    }

    this.filteredCourses = filtered;
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedFilter = select.value;
    this.filterCourses(this.searchControl.value || '');
  }

  selectCourse(course: CourseDTO) {
    this.courseSelected.emit(course);
    this.selectedCourse = course;
    this.isDropdownOpen = false;
    this.selectedCourseDisplay = `${course.courseSuffix} - ${course.courseName}`;
    this.searchControl.setValue(this.selectedCourseDisplay);
  }

  enrollInCourse() {
    if (!this.selectedCourse) return;

    const enrollmentData = {
      userNum: this.authService.getCurrrentUserNum(),
      courseNum: this.selectedCourse.courseNum,
      courseName: this.selectedCourse.courseName,
      courseSuffix: this.selectedCourse.courseSuffix,
      startDate: this.selectedCourse.startDate,
      endDate: this.selectedCourse.endDate,
      courseWeight: this.selectedCourse.courseWeight,
    };

    this.http
      .post('http://localhost:5003/api/StudentCourseEnrollment', enrollmentData)
      .subscribe({
        next: () => {
          this.snackBar.open('Successfully enrolled in the course!', 'Close', {
            duration: 3000,
          });
        },
        error: (err: any) => {
          this.snackBar.open(
            'Failed to enroll. Please try again later.',
            'Close',
            { duration: 3000 }
          );
          console.error(err);
        },
      });
  }
}
