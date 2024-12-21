export interface CourseDTO {
  courseNum: number;
  courseName: string;
  courseSuffix: string;
  courseAlias: string;
  courseDesc?: string;
  extraInformation?: string;
  prerequisites?: string;
  antirequisites?: string;
  courseWeight: number;
  startDate: Date;
  endDate: Date;
  instructor?: string;
  room?: string;
  numEnrolled: number;
  totalSeats: number;
  labComponents?: CourseDTO[];
}

export interface CreateCourseDTO {
  courseName: string;
  courseSuffix: string;
  courseAlias: string;
  courseDesc?: string;
  extraInformation?: string;
  prerequisites?: string;
  antirequisites?: string;
  courseWeight: number;
  startDate: string;
  endDate: string;
  instructor?: string;
  room?: string;
  numEnrolled: number;
  totalSeats: number;
}

export interface CreateCourseTimeDTO {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface CourseResponse {
  courseNum: number;
  message: string;
}
