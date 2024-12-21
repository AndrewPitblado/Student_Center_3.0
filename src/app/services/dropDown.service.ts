import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CourseDTO } from '../interface/course';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  private dropdownStates = new Map<string, BehaviorSubject<boolean>>();
  private filteredCoursesStates = new Map<
    string,
    BehaviorSubject<CourseDTO[]>
  >();

  getDropdownState(id: string): BehaviorSubject<boolean> {
    if (!this.dropdownStates.has(id)) {
      this.dropdownStates.set(id, new BehaviorSubject<boolean>(false));
    }
    return this.dropdownStates.get(id)!;
  }

  getFilteredCourses(id: string): BehaviorSubject<CourseDTO[]> {
    if (!this.filteredCoursesStates.has(id)) {
      this.filteredCoursesStates.set(id, new BehaviorSubject<CourseDTO[]>([]));
    }
    return this.filteredCoursesStates.get(id)!;
  }

  setDropdownState(id: string, isOpen: boolean) {
    this.getDropdownState(id).next(isOpen);
  }

  setFilteredCourses(id: string, courses: CourseDTO[]) {
    this.getFilteredCourses(id).next(courses);
  }
}
