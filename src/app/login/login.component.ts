import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../NavBar/navbar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { AdminStateService } from '../services/admin-state.service';
import { CommonModule } from '@angular/common';
import { LoginCredentials } from '../interface/auth.types';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NavbarComponent,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string | null = null;
  isLoggingIn = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private adminStateService: AdminStateService
  ) {
    this.loginForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  ngOnInit(): void {}
  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: LoginCredentials = {
        userId: this.loginForm.get('userId')?.value,
        password: this.loginForm.get('password')?.value,
      };

      this.authService.authenticate(credentials).subscribe({
        next: (user) => {
          this.adminStateService.setAdminStatus(user.isAdmin);

          this.router.navigate(['/dashboard'], { fragment: 'profile' });
        },
        error: (error) => {
          this.loginError =
            error.status === 409
              ? 'User already has an active session. Please try again later'
              : `Authentication failed: ${error.message}`;
          console.error('Login error:', error);
        },
        complete: () => {
          this.isLoggingIn = false;
        },
      });
    }
  }
}
