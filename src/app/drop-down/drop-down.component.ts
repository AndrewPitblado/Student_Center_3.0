import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CourseDTO } from '../interface/course';
import { DropdownService } from '../services/dropDown.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drop-down',

  imports: [CommonModule],
  styleUrls: ['./drop-down.component.css'],
  templateUrl: './drop-down.component.html',
})
export class DropDownComponent implements OnInit {
  @Input() dropDownId!: string;
  @Input() filteredCourses: CourseDTO[] = [];
  @Output() courseSelected = new EventEmitter<CourseDTO>();

  isOpen$!: Observable<boolean>;

  constructor(private dropdownService: DropdownService) {
    // Initialization moved to ngOnInit()
  }

  ngOnInit() {
    this.isOpen$ = this.dropdownService.getDropdownState(this.dropDownId);
  }

  onCourseSelect(course: CourseDTO) {
    this.courseSelected.emit(course);
    this.dropdownService.setDropdownState(this.dropDownId, false);
  }
}
