import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProfileComponent } from '../profile/profile.component';
import { AddStudentComponent } from '../add-student/add-student.component';
import { CommonModule } from '@angular/common';
import { ScheduleComponent } from '../schedule/schedule.component';
import { AddCourseComponent } from '../add-course/add-course.component';
import { AcademicsComponent } from '../academics/academics.component';
import { FinancialsComponent } from '../financials/financials.component';
import { DocumentsComponent } from '../documents/documents.component';
import { AdminStateService } from '../services/admin-state.service';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../services/theme.service';

interface TabConfig {
  icon: string;
  label: string;
  component: any;
  adminOnly?: boolean;
  studentOnly?: boolean;
}
@Component({
  selector: 'app-tabbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    AddStudentComponent,
    ProfileComponent,
    ScheduleComponent,
    FinancialsComponent,
    AcademicsComponent,
    DocumentsComponent,
    AddCourseComponent,

    CommonModule,
  ],
  templateUrl: './tabbar.component.html',
  styleUrl: './tabbar.component.css',
})
export class TabbarComponent implements OnInit {
  isAdmin$: Observable<boolean>;

  selectedIndex = 0;

  constructor(
    private adminStateService: AdminStateService,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {
    this.isAdmin$ = this.adminStateService.isAdmin$;
  }

  tabs: TabConfig[] = [
    {
      icon: 'account_circle',
      label: 'Profile',
      component: ProfileComponent,
    },
    {
      icon: 'schedule',
      label: 'Schedule',
      component: ScheduleComponent,
      studentOnly: true,
    },
    {
      icon: 'school',
      label: 'Academics',
      component: AcademicsComponent,
      studentOnly: true,
    },
    {
      icon: 'attach_money',
      label: 'Financials',
      component: FinancialsComponent,
      studentOnly: true,
    },
    {
      icon: 'description',
      label: 'Documents',
      component: DocumentsComponent,
      studentOnly: true,
    },
    {
      icon: 'add',
      label: 'Add Course',
      component: AddCourseComponent,
      adminOnly: true,
    },
    {
      icon: 'person_add',
      label: 'Add User',
      component: AddStudentComponent,
      adminOnly: true,
    },
  ];

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      const index = this.tabs.findIndex(
        (tab) => tab.label.toLowerCase() === fragment
      );
      if (index >= 0) {
        this.selectedIndex = index;
      }
    });
  }

  // loadComponent(component: any): void {
  //   const viewContainerRef = this.dynamicTab.viewContainerRef;
  //   viewContainerRef.clear();
  //   viewContainerRef.createComponent(component);
  //   const componentRef: ComponentRef<any> =
  //     viewContainerRef.createComponent(component);
  // }
}
