import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  CreateCourseDTO,
  CreateCourseTimeDTO,
  CourseResponse,
  CourseDTO,
} from '../interface/course';
import { courseService } from '../services/course.service';
import { courseTimesService } from '../services/courseTimes.service';
import e from 'express';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { FormArray } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {
  PrerequisiteService,
  PrerequisiteDTO,
  AntirequisiteDTO,
} from '../services/prerequisite.service';
@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIcon,
    CommonModule,
  ],

  templateUrl: './add-course.component.html',
  styleUrl: './add-course.component.css',
})
export class AddCourseComponent {
  courseForm: FormGroup;
  course: CreateCourseDTO = {
    courseName: '',
    courseSuffix: '',
    courseAlias: '',
    courseDesc: '',
    extraInformation: '',
    prerequisites: '',
    antirequisites: '',
    courseWeight: 0,
    startDate: '',
    endDate: '',
    instructor: '',
    room: '',
    numEnrolled: 0,
    totalSeats: 0,
  };
  courseTime: CreateCourseTimeDTO = {
    weekday: 1,
    startTime: '',
    endTime: '',
  };

  constructor(
    private courseService: courseService,
    private courseTimeService: courseTimesService,
    private prerequisiteService: PrerequisiteService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.courseForm = this.fb.group({
      courseName: ['', Validators.required],
      courseSuffix: ['', Validators.required],
      courseAlias: ['', Validators.required],
      courseDesc: ['', Validators.required],
      extraInformation: [''],
      prerequisites: [''],
      antirequisites: [''],
      courseWeight: [0, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      instructor: ['', Validators.required],
      room: ['', Validators.required],
      numEnrolled: [0, Validators.required],
      totalSeats: [0, Validators.required],
      courseTimes: this.fb.array([this.createCourseTimeGroup()]),
    });
  }
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  createCourseTimeGroup(): FormGroup {
    return this.fb.group({
      weekday: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
  }
  get courseTimes() {
    return this.courseForm.get('courseTimes') as FormArray;
  }
  addCourseTime() {
    this.courseTimes.push(this.createCourseTimeGroup());
  }
  removeCourseTime(index: number) {
    this.courseTimes.removeAt(index);
  }

  onSubmit() {
    if (this.courseForm.valid) {
      const formattedCourse: CreateCourseDTO = {
        ...this.courseForm.value,
        startDate: this.formatDate(new Date(this.courseForm.value.startDate)),
        endDate: this.formatDate(new Date(this.courseForm.value.endDate)),
      };

      this.courseService.addCourse(formattedCourse).subscribe({
        next: (response: CourseResponse) => {
          console.log('Response:', response);
          const courseName = formattedCourse.courseName;
          const prerequisites = formattedCourse.prerequisites?.split(',') || [];
          const antirequisites =
            formattedCourse.antirequisites?.split(',') || [];

          const prereqRequests = prerequisites.map((prereq) => {
            const prereqData: PrerequisiteDTO = {
              course: courseName,
              prerequisiteExpression: prereq.trim(),
            };
            return this.prerequisiteService.addPrerequisites(prereqData);
          });
          const antireqRequests = antirequisites.map((antireq) => {
            const antireqData: AntirequisiteDTO = {
              course: courseName,
              antirequisite: antireq.trim(),
            };
            return this.prerequisiteService.addAntirequisites(antireqData);
          });

          // Use the search API to find the newly created course
          const query = encodeURIComponent(formattedCourse.courseName);
          this.courseService.queryCourses(query).subscribe({
            next: (courses: CourseDTO[]) => {
              // Find the course that matches the submitted details
              const course = courses.find(
                (c) =>
                  c.courseAlias === formattedCourse.courseAlias &&
                  c.courseSuffix === formattedCourse.courseSuffix &&
                  c.courseName === formattedCourse.courseName
              );

              if (!course || !course.courseNum) {
                console.error('Course not found in search results');
                alert('Course created but failed to retrieve course number.');
                return;
              }
              const courseNum = course.courseNum; // Save the course number
              const courseTimesArray = this.courseForm.value.courseTimes.map(
                (ct: any) => ({
                  courseNum: courseNum,
                  weekday: ct.weekday,
                  startTime: ct.startTime + ':00',
                  endTime: ct.endTime + ':00',
                })
              );
              const courseTimeRequests = courseTimesArray.map(
                (courseTime: any) =>
                  this.courseTimeService.createCourseTime(courseTime)
              );

              forkJoin(courseTimeRequests).subscribe({
                next: () => {
                  console.log('Course and time created successfully');
                  alert('Course and schedule created successfully!');
                  this.courseForm.reset();
                },
                error: (error) => {
                  console.error('Error creating course time:', error);
                  alert('Course created but failed to set course time.');
                },
              });
            },
            error: (error) => {
              console.error('Error searching for course:', error);
              alert('Course created but failed to retrieve course number.');
            },
          });
        },
        error: (error) => {
          console.error('Error creating course:', error);
          alert('Failed to create course. Please try again.');
        },
      });
    }
  }
}
