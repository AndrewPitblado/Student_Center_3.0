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
}
