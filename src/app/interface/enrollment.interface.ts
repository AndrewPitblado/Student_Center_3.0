export interface SessionData {
  session: string;
  startTime: string;
  endTime: string;
}

export interface CourseData {
  name: string;
  courseCode: string;
  courseDescription: string;
  courseCredit: number;
  coursePrerequisites: string[];
}
