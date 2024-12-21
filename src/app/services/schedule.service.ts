import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseDTO } from '../interface/course';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private apiUrl = 'http://localhost:5145/api/ScheduleService'; // Update the port if necessary
  private enrolledChangedSubject = new Subject<void>();
  enrollmentChanged$ = this.enrolledChangedSubject.asObservable();
  constructor(private http: HttpClient) {}

  getSchedule(userNum: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/schedule?userNum=${userNum}`);
  }
  getEnrolledCourses(userNum: number): Observable<CourseDTO[]> {
    return this.http.get<CourseDTO[]>(
      `http://localhost:5003/api/StudentCourseEnrollment/user/${userNum}`
    );
  }
  updateSchedule() {
    this.enrolledChangedSubject.next();
  }
  notifyEnrollmentChanged() {
    this.updateSchedule();
  }
  notifyDropChanged() {
    this.updateSchedule();
  }
}
