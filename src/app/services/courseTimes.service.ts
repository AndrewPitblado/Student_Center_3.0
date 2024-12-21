import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { courseTimesDTO } from '../interface/courseTimes';

@Injectable({
  providedIn: 'root',
})
export class courseTimesService {
  private baseUrl = 'http://localhost:5003/api/CourseTime'; // Replace with actual backend URL

  constructor(private http: HttpClient) {}

  // Fetch courseTimes based on enrolled course numbers
  getCourseTimesByCourse(courseNum: number): Observable<courseTimesDTO[]> {
    return this.http.get<courseTimesDTO[]>(
      `http://localhost:5003/api/CourseTime/course/${courseNum}`
    );
  }
  createCourseTime(courseTime: {
    courseNum: number;
    weekday: number;
    startTime: string;
    endTime: string;
  }): Observable<any> {
    return this.http.post(this.baseUrl, courseTime);
  }
}
