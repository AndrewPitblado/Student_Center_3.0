import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminStateService } from '../services/admin-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private adminStateService: AdminStateService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    // if (this.authService.isAdmin()) {
    //   this.router.navigate(['/dashboard'], { fragment: 'profile' });
    //   return true;
    // } else {
    //   this.router.navigate(['/dashboard'], { fragment: 'academics' });
    //   return false;
    // }

    return true;
  }
}
