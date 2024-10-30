import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProfileComponent } from '../profile/profile.component';

import { CommonModule } from '@angular/common';
import { ScheduleComponent } from '../schedule/schedule.component';

import { AcademicsComponent } from '../academics/academics.component';
import { FinancialsComponent } from '../financials/financials.component';
import { DocumentsComponent } from '../documents/documents.component';

@Component({
  selector: 'app-tabbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTabsModule,
    MatIconModule,

    ProfileComponent,
    ScheduleComponent,
    FinancialsComponent,
    AcademicsComponent,
    DocumentsComponent,

    CommonModule,
  ],
  templateUrl: './tabbar.component.html',
  styleUrl: './tabbar.component.css',
})
export class TabbarComponent implements OnInit {
  // asyncTabs: Observable<any>;
  // @ViewChild(DynamicTabDirective, { static: true })
  // dynamicTab!: DynamicTabDirective;
  constructor() {
    // this.asyncTabs = new Observable((observer: Observer<any>) => {
    //   setTimeout(() => {
    //     observer.next([
    //       { label: 'Profile', component: ProfileComponent },
    //       { label: 'Course Schedule', component: ScheduleComponent },
    //       { label: 'Academics', component: AcademicsComponent },
    //       { label: 'Financials', component: FinancialsComponent },
    //       { label: 'Documents', component: DocumentsComponent },
    //     ]);
    //   }, 1000);
    // });
  }
  ngOnInit(): void {}

  // loadComponent(component: any): void {
  //   const viewContainerRef = this.dynamicTab.viewContainerRef;
  //   viewContainerRef.clear();
  //   viewContainerRef.createComponent(component);
  //   const componentRef: ComponentRef<any> =
  //     viewContainerRef.createComponent(component);
  // }
}
