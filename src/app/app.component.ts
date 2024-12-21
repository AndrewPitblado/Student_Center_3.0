import { Component } from '@angular/core';

import { NavbarComponent } from './NavBar/navbar.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { TabbarComponent } from './tabbar/tabbar.component';
import { CommonModule } from '@angular/common';
import { ScheduleComponent } from './schedule/schedule.component';
import { EnrollmentComponent } from './enrollment/enrollment.component';

import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'student_center_3.0';
  constructor(private themeService: ThemeService) {}
}
