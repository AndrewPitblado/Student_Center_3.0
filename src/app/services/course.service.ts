import { map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { CourseDTO } from '../interface/course';
import {
  BehaviorSubject,
  from,
  generate,
  Observable,
  of,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class courseService {
  private apiUrl = 'http://localhost:5003/api/Course';
  private apiUrl2 = 'http://localhost:5003/api/Course';
  constructor(private http: HttpClient) {}

  // HTTP Headers
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // Add any additional headers you need
      }),
    };
  }

  // Error Handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred with the course operation';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = `Bad Request: ${
            error.error?.message || 'Invalid course data'
          }`;
          break;
        case 404:
          errorMessage = 'Course not found';
          break;
        case 409:
          errorMessage = 'Course already exists';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${
            error.error?.message || 'Unknown error'
          }`;
      }
    }
    console.error('Course Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
  // CRUD Operations with courseNum
  getAllCourses(): Observable<CourseDTO[]> {
    return this.http
      .get<CourseDTO[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getCourseById(courseNum: number): Observable<CourseDTO> {
    return this.http
      .get<CourseDTO>(`${this.apiUrl}/${courseNum}`)
      .pipe(catchError(this.handleError));
  }

  createCourse(course: CourseDTO): Observable<CourseDTO> {
    return this.http
      .post<CourseDTO>(this.apiUrl, course, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  updateCourse(courseNum: number, course: CourseDTO): Observable<CourseDTO> {
    return this.http
      .put<CourseDTO>(
        `${this.apiUrl}/${courseNum}`,
        course,
        this.getHttpOptions()
      )
      .pipe(catchError(this.handleError));
  }

  deleteCourse(courseNum: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${courseNum}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Search and Filter Methods
  searchCourses(searchTerm: string): Observable<CourseDTO[]> {
    return this.getAllCourses().pipe(
      map((courses) =>
        courses.filter(
          (course) =>
            course.courseName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            course.courseAlias
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            course.courseSuffix.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  // Enrollment Management
  checkSeatAvailability(courseNum: number): Observable<boolean> {
    return this.getCourseById(courseNum).pipe(
      map((course) => course.numEnrolled < course.totalSeats)
    );
  }

  getRemainingSeats(courseNum: number): Observable<number> {
    return this.getCourseById(courseNum).pipe(
      map((course) => course.totalSeats - course.numEnrolled)
    );
  }

  // Schedule Methods
  getCurrentCourses(): Observable<CourseDTO[]> {
    const today = new Date();
    return this.getAllCourses().pipe(
      map((courses) =>
        courses.filter(
          (course) =>
            new Date(course.startDate) <= today &&
            new Date(course.endDate) >= today
        )
      )
    );
  }

  getUpcomingCourses(): Observable<CourseDTO[]> {
    const today = new Date();
    return this.getAllCourses().pipe(
      map((courses) =>
        courses.filter((course) => new Date(course.startDate) > today)
      )
    );
  }

  // Course Requirements Methods
  getCoursesByWeight(weight: number): Observable<CourseDTO[]> {
    return this.getAllCourses().pipe(
      map((courses) =>
        courses.filter((course) => course.courseWeight === weight)
      )
    );
  }

  // Room and Instructor Management
  getCoursesByRoom(room: string): Observable<CourseDTO[]> {
    return this.getAllCourses().pipe(
      map((courses) => courses.filter((course) => course.room === room))
    );
  }

  getCoursesByInstructor(instructor: string): Observable<CourseDTO[]> {
    return this.getAllCourses().pipe(
      map((courses) =>
        courses.filter((course) =>
          course.instructor?.toLowerCase().includes(instructor.toLowerCase())
        )
      )
    );
  }

  // Helper Methods
  formatCourseCode(course: CourseDTO): string {
    return `${course.courseAlias}-${course.courseSuffix}`;
  }

  validateCourse(course: CourseDTO): boolean {
    return !!(
      course.courseNum &&
      course.courseName &&
      course.courseSuffix &&
      course.courseAlias &&
      course.courseWeight > 0 &&
      course.startDate &&
      course.endDate &&
      course.totalSeats > 0 &&
      new Date(course.startDate) < new Date(course.endDate)
    );
  }

  // Batch Operations
  updateMultipleCourses(courses: CourseDTO[]): Observable<CourseDTO[]> {
    return this.http
      .put<CourseDTO[]>(`${this.apiUrl}/batch`, courses, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  deleteMultipleCourses(courseNums: number[]): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/batch`, {
        ...this.getHttpOptions(),
        body: courseNums,
      })
      .pipe(catchError(this.handleError));
  }
}
