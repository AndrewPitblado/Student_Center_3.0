import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentCourseHistory {
  userNum: number;
  course: string;
  courseWeight: number;
}

@Injectable({
  providedIn: 'root',
})
export class CourseHistoryService {
  private baseUrl = 'http://localhost:5003/api/StudentCourseHistory';

  constructor(private http: HttpClient) {}

  addCourseToHistory(history: StudentCourseHistory): Observable<any> {
    return this.http.post(this.baseUrl, history);
  }
  removeCourseFromHistory(userNum: number, course: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${userNum}/${course}`);
  }
}
