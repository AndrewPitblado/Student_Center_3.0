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
  debounce,
  debounceTime,
  delay,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ScheduleService } from '../services/schedule.service';
import { DropdownService } from '../services/dropDown.service';
import { MatButton } from '@angular/material/button';
import { OnDestroy } from '@angular/core';
import { Subject, filter, fromEvent } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownComponent } from '../drop-down/drop-down.component';
import { CourseHistoryService } from '../services/courseHistory.service';

export enum SearchType {
  NORMAL = 'normal',
  SWAP_ADD = 'swap_add',
  SWAP_DROP = 'swap_drop',
}
@Component({
  selector: 'app-course-selector',
  standalone: true,
  imports: [
    MatSnackBarModule,
    MatInput,
    MatOptionModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButton,
    MatCardModule,
    DropDownComponent,
  ],
  templateUrl: './course-selector.component.html',
  styleUrls: ['./course-selector.component.css'],
})
export class CourseSelectorComponent implements OnInit, OnDestroy {
  private skipNextSearch = false;
  private clickOutside$ = new Subject<void>();
  @Output() courseSelected = new EventEmitter<CourseDTO>();
  @ViewChild('courseDropdown') courseDropdown!: ElementRef;
  @ViewChild('courseInput') courseInput!: ElementRef;
  @ViewChild('swapAddInput') swapAddInput!: ElementRef;
  @ViewChild('swapAddDropdown') swapAddDropdown!: ElementRef;
  @ViewChild('swapDropInput') swapDropInput!: ElementRef;
  @ViewChild('swapDropDropdown') swapDropDropdown!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    const isOutsideInput =
      this.courseInput && !this.courseInput.nativeElement.contains(target);
    const isOutsideDropdown =
      this.courseDropdown &&
      !this.courseDropdown.nativeElement.contains(target);

    if (isOutsideInput && isOutsideDropdown) {
      this.isDropdownOpen = false;
    }
    const isOutsideSwapAddInput =
      this.swapAddInput && !this.swapAddInput.nativeElement.contains(target);
    const isOutsideSwapAddDropdown =
      this.swapAddDropdown &&
      !this.swapAddDropdown.nativeElement.contains(target);

    if (isOutsideSwapAddInput && isOutsideSwapAddDropdown) {
      this.isSwapAddDropdownOpen = false;
    }

    const isOutsideSwapDropInput =
      this.swapDropInput && !this.swapDropInput.nativeElement.contains(target);
    const isOutsideSwapDropDropdown =
      this.swapDropDropdown &&
      !this.swapDropDropdown.nativeElement.contains(target);

    if (isOutsideSwapDropInput && isOutsideSwapDropDropdown) {
      this.isSwapDropDropdownOpen = false;
    }
  }

  courses: CourseDTO[] = [];
  filteredCourses: CourseDTO[] = [];
  swapAddFilteredCourses: CourseDTO[] = [];
  swapDropFilteredCourses: CourseDTO[] = [];
  searchControl = new FormControl('');
  addCourseControl = new FormControl('');
  dropCourseControl = new FormControl('');
  selectedFilter = 'all';
  isDropdownOpen = false;
  isSwapAddDropdownOpen = false;
  isSwapDropDropdownOpen = false;
  isLoading = false;
  error: string | null = null;
  selectedCourseDisplay: string = '';
  selectedCourse!: CourseDTO;
  selectedEnrolledCourse!: CourseDTO;
  selectedAddCourse!: CourseDTO;
  selectedSwapCourse!: CourseDTO;
  searchQuery: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private courseService: courseService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private authService: AuthService,
    private dropdownService: DropdownService,
    private scheduleService: ScheduleService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private courseHistoryService: CourseHistoryService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.dropdownService.setDropdownState('main-dropdown', false);
    this.dropdownService.setDropdownState('swap-add-dropdown', false);
    this.dropdownService.setDropdownState('swap-drop-dropdown', false);
    this.setupSearchControl(this.searchControl, SearchType.NORMAL);
    this.setupSearchControl(this.addCourseControl, SearchType.SWAP_ADD);
    this.setupSearchControl(this.dropCourseControl, SearchType.SWAP_DROP);

    //Set up search with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        if (this.skipNextSearch) {
          this.skipNextSearch = false;
          return;
        }
        if (query) {
          this.isLoading = true;
          this.isDropdownOpen = true;
          this.searchQuery = query;
          this.filterCourses(query);
          this.isLoading = false;
        } else {
          this.filteredCourses = [];
          this.isDropdownOpen = false;
          this.isLoading = false;
        }
      });
    this.clickOutside$
      .pipe(
        debounceTime(200),
        filter(() => this.isDropdownOpen)
      )
      .subscribe(() => {
        this.isDropdownOpen = false;
      });
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

  private setupSearchControl(control: FormControl, type: SearchType) {
    control.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        const dropdownId = this.getDropdownId(type);
        if (query) {
          this.filterAndSetCourses(query, type);
          this.dropdownService.setDropdownState(dropdownId, true);
        } else {
          this.dropdownService.setDropdownState(dropdownId, false);
        }
      });
  }
  private getDropdownId(type: SearchType): string {
    switch (type) {
      case SearchType.NORMAL:
        return 'main-dropdown';
      case SearchType.SWAP_ADD:
        return 'swap-add-dropdown';
      case SearchType.SWAP_DROP:
        return 'swap-drop-dropdown';
    }
  }
  private filterAndSetCourses(query: string, type: SearchType) {
    const filtered = this.filterCourses(query, type);
    const dropdownId = this.getDropdownId(type);
    this.dropdownService.setFilteredCourses(dropdownId, filtered);
  }
  onFocus(controlType: SearchType) {
    const dropdownId = this.getDropdownId(controlType);
    this.filterAndSetCourses('', controlType);
    this.dropdownService.setDropdownState(dropdownId, true);
  }

  onAddCourseFocus() {
    this.onFocus(SearchType.SWAP_ADD);
  }

  onDropCourseFocus() {
    this.onFocus(SearchType.SWAP_DROP);
  }

  onMainCourseFocus() {
    this.onFocus(SearchType.NORMAL);
  }

  filterCourses(
    searchTerm: string,
    searchType: SearchType = SearchType.NORMAL
  ): CourseDTO[] {
    let filtered = [...this.courses];
    console.log(
      'Initial courses:',
      filtered.map((c) => `${c.courseAlias} ${c.courseSuffix}`)
    );
    filtered.forEach((course) => {
      console.log(`Course: ${course.courseAlias} ${course.courseSuffix}`);
      if (course.labComponents) {
        console.log('Lab components:', course.labComponents);
        course.labComponents.forEach((lab) => {
          console.log(`- Lab: ${lab.courseAlias} ${lab.courseSuffix}`);
        });
      }
    });
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.courseName.toLowerCase().includes(term) ||
          course.courseAlias.toLowerCase().includes(term) ||
          course.courseSuffix.toLowerCase().includes(term)
      );
    }
    switch (searchType) {
      case SearchType.NORMAL:
        this.filteredCourses = filtered;
        break;
      case SearchType.SWAP_ADD:
        this.swapAddFilteredCourses = filtered.filter(
          (course) => course.numEnrolled < course.totalSeats
        );
        break;
      case SearchType.SWAP_DROP:
        this.swapDropFilteredCourses = filtered.filter(
          (course) => course.numEnrolled > 0
        );
        break;
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
      case 'fall':
        filtered = filtered.filter((course) => {
          const suffix = course.courseSuffix.trim();
          console.log(
            `Checking course ${course.courseAlias} with suffix: '${suffix}'`
          );
          return suffix === 'A';
        });
        break;
      case 'winter':
        filtered = filtered.filter(
          (course) => course.courseSuffix.trim().toLocaleUpperCase() === 'B'
        );
        break;
    }
    console.log(
      'Filtered courses:',
      filtered.map((c) => `${c.courseAlias} ${c.courseSuffix}`)
    );
    this.filteredCourses = filtered;
    return filtered;
  }

  onFilterChange(value: string) {
    console.log('Filter changed to:', value);
    this.selectedFilter = value;
    this.filterCourses(this.searchControl.value || '');
  }

  selectCourse(course: CourseDTO) {
    this.skipNextSearch = true;
    //this.courseSelected.emit(course);
    this.selectedCourse = course;
    this.isDropdownOpen = false;
    this.selectedCourseDisplay = `${course.courseName} - ${course.courseAlias}`;
    this.searchControl.setValue(this.selectedCourseDisplay, {
      emitEvent: false,
    });
  }
  selectSwapAddCourse(course: CourseDTO) {
    this.skipNextSearch = true;
    this.selectedAddCourse = course;
    this.isSwapAddDropdownOpen = false;
    this.addCourseControl.setValue(
      `${course.courseName} - ${course.courseAlias}`,
      { emitEvent: false }
    );
  }
  selectSwapDropCourse(course: CourseDTO) {
    this.skipNextSearch = true;
    this.selectedSwapCourse = course;
    this.isSwapDropDropdownOpen = false;
    this.dropCourseControl.setValue(
      `${course.courseName} - ${course.courseAlias}`,
      { emitEvent: false }
    );
  }

  enrollInCourse() {
    const userNum = this.authService.getCurrrentUserNum();
    if (!this.selectedCourse) return;
    if (!this.validatePreRequisites(this.selectedCourse)) {
      this.snackBar.open(
        `Pre-requisites not met: ${this.selectedCourse.prerequisites}`,
        'Close',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
      return;
    }

    const requestBody = [this.selectedCourse.courseNum];
    console.log('Sending enrollment request:', requestBody);
    this.http
      .post(
        `http://localhost:5145/api/CourseEnrollmentService/AddCourses/${userNum}`,
        requestBody,
        { responseType: 'text' }
      )
      .subscribe({
        next: (response) => {
          const currentUserNum = userNum;
          if (currentUserNum === null) {
            this.snackBar.open('User not found', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
            return;
          }

          const historyEntry = {
            userNum: currentUserNum,
            course:
              this.selectedCourse.courseAlias === 'LAB' ||
              this.selectedCourse.courseAlias === 'TUT'
                ? `${this.selectedCourse.courseName} ${this.selectedCourse.courseAlias}`
                : this.selectedCourse.courseName,
            courseWeight: this.selectedCourse.courseWeight,
          };

          this.courseHistoryService.addCourseToHistory(historyEntry).subscribe({
            next: () => {
              this.snackBar.open(
                'Successfully enrolled in the course!',
                'Close',
                {
                  duration: Infinity,
                  panelClass: ['success-snackbar'],
                  verticalPosition: 'top',
                }
              );
              this.scheduleService.notifyEnrollmentChanged();
              this.selectedCourse = null as any;
              this.selectedCourseDisplay = '';
              this.searchControl.setValue('');
            },
            error: (err) => {
              console.error('Error adding course to history:', err);
              this.snackBar.open(
                'Enrolled in course but Failed to add course to history.',
                'Close',
                {
                  duration: 5000,
                  panelClass: ['error-snackbar'],
                }
              );
            },
          });
        },
        error: (err: any) => {
          console.error('Enrollment error:', err);
          let errorMessage = 'Failed to enroll. Please try again later.';
          if (err.status === 409 || err.error?.includes('already enrolled')) {
            errorMessage = 'You are already enrolled in this course.';
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          console.error(err);
        },
      });
  }

  dropCourse() {
    if (!this.selectedCourse) return;
    const userNum = this.authService.getCurrrentUserNum();
    const courseNum = this.selectedCourse.courseNum;

    this.http
      .post(
        `http://localhost:5145/api/CourseEnrollmentService/DropCourse/${userNum}/${courseNum}`,
        {},
        { responseType: 'text' }
      )
      .subscribe({
        next: () => {
          if (userNum === null) {
            this.snackBar.open('User not found', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
            return;
          }
          if (
            this.selectedCourse.courseAlias === 'LAB' ||
            this.selectedCourse.courseAlias === 'TUT'
          ) {
            this.selectedCourse.courseName = `${this.selectedCourse.courseName} ${this.selectedCourse.courseAlias}`;
          }
          this.courseHistoryService
            .removeCourseFromHistory(userNum, this.selectedCourse.courseName)
            .subscribe({
              next: () => {
                this.snackBar.open(
                  'Successfully dropped the course!',
                  'Close',
                  {
                    duration: Infinity,
                    panelClass: ['success-snackbar'],
                  }
                );
                //Reset selected course
                this.scheduleService.notifyEnrollmentChanged();
                this.selectedCourse = null as any;
                this.selectedCourseDisplay = '';
                this.searchControl.setValue('');
              },
              error: (err) => {
                console.error('Error removing course from history:', err);
                this.snackBar.open(
                  'Dropped course but failed to remove course from history.',
                  'Close',
                  {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                  }
                );
              },
            });

          //Reset selected course
        },
        error: (err: any) => {
          let errorMessage = 'Failed to drop course, Please try again later.';
          if (err.status === 404) {
            errorMessage = 'You are not currently enrolled in this course.';
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }
  swapCourse() {
    if (!this.selectedAddCourse || !this.selectedSwapCourse) {
      this.snackBar.open('Please select courses to swap.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }
    const userNum = this.authService.getCurrrentUserNum();
    const dropCourseNum = this.selectedSwapCourse.courseNum;
    const addCourseNums = [this.selectedAddCourse.courseNum];
    const url = `http://localhost:5145/api/CourseEnrollmentService/SwapCourse/${userNum}/${dropCourseNum}`;

    this.http.post(url, addCourseNums, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.scheduleService.notifyEnrollmentChanged();
        this.snackBar.open('Courses successfully swapped.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
        this.selectedAddCourse = null as any;
        this.selectedSwapCourse = null as any;
        this.selectedCourseDisplay = '';
        this.addCourseControl.setValue('');
        this.dropCourseControl.setValue('');
      },
      error: (err: any) => {
        let errorMessage = 'Failed to swap courses. Please try again later.';
        if (err.error) {
          errorMessage = `Failed to swap courses: ${err.error}`;
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
  private validatePreRequisites(course: CourseDTO): boolean {
    if (!course.prerequisites) return true;

    return this.courses.some((enrolled) =>
      course.prerequisites?.includes(enrolled.courseSuffix)
    );
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.error = 'Please enter a search term';
      return;
    }
    this.isLoading = true;
    this.error = '';

    this.courseService.queryCourses(this.searchQuery).subscribe({
      next: (data) => {
        this.courses = data;
        this.filteredCourses = data;
        this.error = '';
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.error = 'No courses found';
        } else {
          this.error = 'An error occurred while searching';
        }
        this.courses = [];
        this.filteredCourses = [];
        this.isLoading = false;
      },
    });
  }
  clearSearch() {
    if (this.selectedCourse) {
      this.searchControl.setValue('', { emitEvent: false });
      this.selectedCourse = null as any;
      this.selectedCourseDisplay = '';
    }
  }
}
