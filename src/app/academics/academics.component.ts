import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { EnrollmentComponent } from '../enrollment/enrollment.component'; // adjust path as needed
import { Component, OnInit, Type } from '@angular/core';
@Component({
  selector: 'app-academics',
  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatNavList,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    EnrollmentComponent,
  ],
  templateUrl: './academics.component.html',
  styleUrl: './academics.component.css',
})
export class AcademicsComponent implements OnInit {
  public EnrollmentComponent = EnrollmentComponent;
  isDrawerOpen = false;
  currentComponent: Type<any> | null = null;
  selectedComponent: Type<any> | null = null;

  ngOnInit() {
    this.currentComponent = EnrollmentComponent;
    this.selectedComponent = EnrollmentComponent;
  }

  toggleDrawer(drawer: any) {
    drawer.toggle();
    this.isDrawerOpen = !this.isDrawerOpen;
  }
  loadComponent(component: Type<any>) {
    try {
      console.log('Attempting to load component:', component.name);
      this.currentComponent = component;
      this.selectedComponent = component;
      console.log(
        'Current component set to:',
        this.currentComponent?.name || 'None'
      );
    } catch (error) {
      console.error('Error loading component:', error);
    }
  }
}
