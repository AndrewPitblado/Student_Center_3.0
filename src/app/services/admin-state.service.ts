import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminStateService {
  private isAdmin = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdmin.asObservable();

  setAdminStatus(status: boolean) {
    this.isAdmin.next(status);
    localStorage.setItem('isAdmin', String(status));
  }
}
