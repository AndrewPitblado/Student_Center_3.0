import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AcademicsComponent } from './academics/academics.component';
import { EnrollmentComponent } from './enrollment/enrollment.component';
import { LoginComponent } from './login/login.component';
import { TabbarComponent } from './tabbar/tabbar.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: TabbarComponent,
    canActivate: [AuthGuard],
  },
  // { path: 'admin', component: TabbarComponent, canActivate: [AuthGuard] },
  // { path: 'user', component: TabbarComponent, canActivate: [AuthGuard] },
  // { path: '**', redirectTo: 'user' },
];
