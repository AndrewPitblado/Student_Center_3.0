import { Component, OnDestroy, OnInit } from '@angular/core';
import { TabbarComponent } from '../tabbar/tabbar.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScheduleService } from '../services/schedule.service';
import { courseService } from '../services/course.service';
import { CourseDTO } from '../interface/course';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { courseTimesDTO } from '../interface/courseTimes';
import { courseTimesService } from '../services/courseTimes.service';
import { forkJoin } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})
export class ScheduleComponent implements OnInit, OnDestroy {
  private enrolledCoursesSubject = new BehaviorSubject<CourseDTO[]>([]);
  private destroy$ = new Subject<void>();
  enrolledCourses$ = this.enrolledCoursesSubject.asObservable();
  schedule: any = { semester1: [], semester2: [] };
  userNum: number;
  enrolledCourses: CourseDTO[] = [];
  courseTimes: courseTimesDTO[] = [];
  courseNums: number[] = [];
  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService,

    private courseService: courseService,

    private courseTimesService: courseTimesService
  ) {
    this.userNum = this.authService.getCurrrentUserNum() ?? 0;
    this.enrolledCourses$.subscribe((courses) => {
      this.enrolledCourses = courses;
      this.categorizeCourses(courses);
      this.courseNums = courses.map((course) => course.courseNum);
      this.fetchCourseTimes();
    });
  }
  refreshSchedule() {
    this.scheduleService.getEnrolledCourses(this.userNum).subscribe(
      (courses) => this.enrolledCoursesSubject.next(courses),
      (error) => console.error('Error fetching schedule:', error)
    );
  }
  ngOnInit(): void {
    this.scheduleService.getEnrolledCourses(this.userNum).subscribe(
      (courses) => {
        console.log('Received schedule data:', courses);
        this.enrolledCourses = courses;
        this.categorizeCourses(courses);
        this.courseNums = this.enrolledCourses.map(
          (course) => course.courseNum
        ); // Assign the entire data object
        this.fetchCourseTimes();
        console.log('Enrolled courses:', this.enrolledCourses);
        console.log('Course numbers:', this.courseNums);
      },
      (error) => {
        console.error('Error fetching schedule:', error);
      }
    );
    this.scheduleService.enrollmentChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshSchedule();
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCourseTimes() {
    if (this.courseNums.length === 0) {
      console.log('No course numbers to fetch');
      return;
    }
    const requests = this.courseNums.map((courseNum) =>
      this.courseTimesService.getCourseTimesByCourse(courseNum)
    );

    forkJoin(requests).subscribe(
      (responses: courseTimesDTO[][]) => {
        this.courseTimes = responses.flat();
        console.log('Received course times:', this.courseTimes);
      },
      (error) => console.error('Error fetching course times:', error)
    );
  }

  calculateStyle(courseTime: courseTimesDTO): any {
    const hourHeight = 50; // Height of 1 hour in pixels
    const startHour = parseInt(courseTime.startTime.split(':')[0], 10);
    const startMinutes = parseInt(courseTime.startTime.split(':')[1], 10);

    const endHour = parseInt(courseTime.endTime.split(':')[0], 10);
    const endMinutes = parseInt(courseTime.endTime.split(':')[1], 10);

    const totalStart = startHour + startMinutes / 60;
    const totalEnd = endHour + endMinutes / 60;

    return {
      top: `${(totalStart - 8) * hourHeight}px`, // Adjust top position based on time (8 AM start)
      height: `${(totalEnd - totalStart) * hourHeight}px`,
    };
  }
  getDayName(weekday: number): string {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return days[weekday - 1];
  }

  timeSlots = this.generateTimeSlots(); // Create time slots array like '8:00 AM', '8:30 AM'...
  weekdays = [
    { id: 1, name: 'Mon' },
    { id: 2, name: 'Tue' },
    { id: 3, name: 'Wed' },
    { id: 4, name: 'Thu' },
    { id: 5, name: 'Fri' },
  ];
  getWeekdayName(weekday: number | string | undefined): string {
    // console.log('Converting weekday:', weekday);
    if (weekday === undefined) return 'Unknown Day';
    // Define the mapping between numeric weekdays and weekday names
    const daysMap: { [key: number]: string } = {
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
    };

    // If the input is already a string (e.g., 'Mon'), return it directly
    if (typeof weekday === 'string') {
      return weekday;
    }

    // Convert numeric weekdays to the string representation
    return typeof weekday === 'string'
      ? weekday
      : daysMap[weekday] || 'Unknown Day';
  }

  // Returns the course name based on courseNum
  getCourseName(courseNum: number): string {
    const course = this.enrolledCourses.find((c) => c.courseNum === courseNum);
    return course ? course.courseName : 'Unknown Course';
  }
  // Dynamically position courses in the grid
  getCourseStyle(courseTime: courseTimesDTO) {
    const dayIndex = this.weekdays.findIndex(
      (day) => day.name === this.getWeekdayName(courseTime.weekday)
    );

    if (dayIndex === -1) return {};
    const startHour = this.convertTimeToGridRow(courseTime.startTime);
    const endHour = this.convertTimeToGridRow(courseTime.endTime);
    const duration = endHour - startHour;

    return {
      gridColumn: `${dayIndex + 2}`, // Day column (account for time column)
      gridRow: `${startHour} / span ${duration}`, // Start row and height
      backgroundColor: this.getCourseColor(courseTime.courseNum),
      height: '100%',
      margin: '1px', // Optional
    };
  }
  // Convert time string (e.g., 8:30 AM) to grid row index
  convertTimeToGridRow(time: string): number {
    //console.log('Converting time:', time);
    const [hour, minutes] = time.split(':').map(Number); // Split "8:30 AM" to ["8", "30", "AM"]
    const baseRow = 2; // Start from the second row (after the header row)
    const hourOffset = (hour - 8) * 2; // Convert 8 AM to 0, 9 AM to 2, etc.
    const minuteOffset = minutes >= 30 ? 1 : 0; // Add 1 if it's 30 minutes or more
    const gridRow = hourOffset + minuteOffset + baseRow; // Add 1 to account for the header row
    return gridRow;
  }
  private readonly COURSE_COLOR_MAP: { [key: string]: string } = {
    'Calculus 1000': '#4400AA',
    'Calculus 1301': '#87CEFA',
    'Calculus 1501': '#98FB98',
    'Mathematics 1600': '#DA70D6',
    'Computer Science 1026': '#FF0000',
    'Computer Science 1027': '#FFAAA4',
    'Computer Science 2208': '#87CEFA',
    'Computer Science 2209': '#DA70D6',
    'Computer Science 2210': '#229955',
    'Computer Science 2211': '#FFD700',
    'Computer Science 2212': '#FFA22F',
    'Data Science 3000': '#1b8ec4',
  };

  // Optional: Assign colors to courses
  getCourseColor(courseNum: number): string {
    const course = this.enrolledCourses.find((c) => c.courseNum === courseNum);
    if (!course) return '#808080'; // Gray fallback if course not found

    // Try to find color by course title/alias
    const courseColor = this.COURSE_COLOR_MAP[course.courseName];
    if (courseColor) return courseColor;

    // Fallback colors for unmapped courses
    const fallbackColors = [
      '#FFA07A',
      '#87CEFA',
      '#98FB98',
      '#DA70D6',
      '#FFD700',
    ];
    return fallbackColors[courseNum % fallbackColors.length];
  }

  getCoursesForDay(day: number) {
    return this.courseTimes.filter((course) => course.weekday === day);
  }

  convertTimeToHour(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }
  generateTimeSlots(): string[] {
    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      // From 8 AM to 9 PM
      slots.push(`${displayHour}:00 ${period}`);
      slots.push(`${displayHour}:30 ${period}`);
    }
    return slots;
  }
  formatTime(time: string): string {
    const [hour, minutes] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  categorizeCourses(courses: CourseDTO[]) {
    const semester1Start = new Date('2024-09-01');
    const semester1End = new Date('2024-12-15');
    const semester2Start = new Date('2025-01-15');
    const semester2End = new Date('2025-05-15');

    courses.forEach((course) => {
      const courseStart = new Date(course.startDate);
      const courseEnd = new Date(course.endDate);

      if (courseStart >= semester1Start && courseEnd <= semester1End) {
        this.schedule.semester1.push(course);
      } else if (courseStart >= semester2Start && courseEnd <= semester2End) {
        this.schedule.semester2.push(course);
      }
    });
    console.log('Updated schedule:', this.schedule);
  }
  isInSemester(courseTime: courseTimesDTO, semester: number): boolean {
    const course = this.enrolledCourses.find(
      (c) => c.courseNum === courseTime.courseNum
    );
    if (!course) return false;
    const courseStart = new Date(course.startDate);
    const courseEnd = new Date(course.endDate);
    if (semester === 1) {
      const semester1Start = new Date('2024-09-01');
      const semester1End = new Date('2024-12-15');
      return courseStart >= semester1Start && courseEnd <= semester1End;
    } else if (semester === 2) {
      const semester2Start = new Date('2025-01-01');
      const semester2End = new Date('2025-05-15');
      return courseStart >= semester2Start && courseEnd <= semester2End;
    }
    return false;
  }
  getCourseType(courseNum: number): string {
    const course = this.enrolledCourses.find((c) => c.courseNum === courseNum);
    if (!course || !course.courseAlias) return 'Unknown Course';

    if (course.courseAlias.includes('LAB')) return 'LAB';
    if (course.courseAlias.includes('TUT')) return 'TUT';
    return 'LEC';
  }
}
