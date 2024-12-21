import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PrerequisiteDTO {
  course: string;
  prerequisiteExpression: string;
}
export interface AntirequisiteDTO {
  course: string;
  antirequisite: string;
}
@Injectable({
  providedIn: 'root',
})
export class PrerequisiteService {
  private prereqUrl = 'http://localhost:5003/api/CoursePrerequisite';
  private antireqUrl = 'http://localhost:5003/api/CourseAntirequisite';
  constructor(private http: HttpClient) {}

  addPrerequisites(prereqData: PrerequisiteDTO): Observable<any> {
    return this.http.post<PrerequisiteDTO>(this.prereqUrl, prereqData);
  }

  addAntirequisites(antireqData: AntirequisiteDTO): Observable<any> {
    return this.http.post<AntirequisiteDTO>(this.antireqUrl, antireqData);
  }
}
