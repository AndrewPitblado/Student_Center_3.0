import { Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  from,
  generate,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import {
  LoginResponse,
  User,
  LoginDTO,
  LoginCredentials,
  UserDTO,
} from '../interface/auth.types';
import { map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { url } from 'inspector';
import { error, log } from 'console';
import { AdminStateService } from './admin-state.service';

interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  traceId: string;
  detail?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiurl = 'http://localhost:5003/api';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private updateStoredUserData(user: User): void {
    localStorage.setItem('userData', JSON.stringify(user));
  }

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    public adminStateService: AdminStateService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.isAuthenticatedSubject.next(!!localStorage.getItem('userNum'));
    }
  }

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  logout(): void {
    const userId = localStorage.getItem('userId');

    console.log('Starting logout process for userId:', userId);
    this.clearLocalStorage();
    this.isAuthenticatedSubject.next(false);
  }

  authenticate(credentials: LoginCredentials): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };

    return this.http
      .get<LoginDTO>(`${this.apiurl}/Login/${credentials.userId}`)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            const storedUserData = localStorage.getItem('pendingUserData');
            if (storedUserData) {
              return this.createNewUserAndLogin(credentials, httpOptions);
            } else {
              return throwError(() => new Error('No pending user data found'));
            }
          }
          return throwError(() => error);
        }),
        switchMap((login) => {
          if (login) {
            console.log('Found existing login:', login);
            return this.http
              .get<User>(`${this.apiurl}/User/${login.userNum}`)
              .pipe(
                tap((existingUser) => {
                  localStorage.setItem('userId', credentials.userId);
                  localStorage.setItem(
                    'userNum',
                    existingUser.userNum.toString()
                  );
                  localStorage.setItem(
                    'isAdmin',
                    existingUser.isAdmin.toString()
                  );
                  this.updateStoredUserData(existingUser);
                  this.isAuthenticatedSubject.next(true);
                }),
                map((existingUser) => {
                  if (existingUser.isAdmin) {
                    this.adminStateService.setAdminStatus(true);
                  } else {
                    this.adminStateService.setAdminStatus(false);
                  }
                  return existingUser;
                })
              );
          } else {
            console.log('Login not found, creating new user');
            return this.checkAndCreateUser(credentials, httpOptions);
          }
        }),
        catchError((error) => {
          // if (error.status === 404) {
          //   console.log('Login not found, creating new user');
          //   return this.checkAndCreateUser(credentials, httpOptions);
          // }
          console.error('Authentication error:', error);
          return throwError(() => error);
        })
      );
  }
  // Helper method to check for user existence before creation
  checkAndCreateUser(credentials: LoginCredentials, httpOptions: any) {
    return this.createNewUserAndLogin(credentials, httpOptions).pipe(
      //return this.http.get<User>(`${this.apiurl}/User`).pipe(
      catchError((error) => {
        if (error.status === 404) {
          // User does not exist, safe to create
          return this.createNewUserAndLogin(credentials, httpOptions);
        }

        throw error; // Rethrow unexpected errors
      })
    );
  }

  generateRandomUserNum(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  // Helper method to determine if user needs updating
  private needsUpdate(user: User, credentials: LoginCredentials): boolean {
    // Add your update criteria here
    return false; // placeholder
  }

  private getApiErrorMessage(apiError: ApiErrorResponse): string {
    switch (apiError.type) {
      case 'https://tools.ietf.org/html/rfc9110#section-15.5.10':
        return 'User already has an active session. Please try again later.';
      default:
        return `Authentication conflict: ${apiError.title}. Please try again.`;
    }
  }

  private clearLocalStorage(): void {
    const pendingUserData = localStorage.getItem('pendingUserData');
    localStorage.clear();
    if (pendingUserData) {
      localStorage.setItem('pendingUserData', pendingUserData);
    }
    // localStorage.removeItem('userId');
    // localStorage.removeItem('userNum');
    // localStorage.removeItem('isAdmin');
    // localStorage.removeItem('userData');
  }

  getUserProfile(userNum: number): Observable<User> {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const userData = JSON.parse(storedData);
      if (userData.userNum === userNum) {
        return of(userData);
      }
    }

    return this.http.get<User>(`${this.apiurl}/User/${userNum}`).pipe(
      tap((user) => {
        this.updateStoredUserData(user);
        console.log('Fetched user:', user);
      }),
      catchError((error) => {
        console.error('Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }

  updateProfile(user: User): Observable<User> {
    return this.http
      .put<User>(`${this.apiurl}/User/${user.userNum}`, user)
      .pipe(
        map((response) => response || user),
        tap((updatedUser) => {
          this.updateStoredUserData(updatedUser);
          console.log('Updated user:', updatedUser);
        }),
        catchError((error) => {
          console.error('Profile update error:', error);
          return throwError(() => error);
        })
      );
  }

  private createNewUserAndLogin(
    credentials: LoginCredentials,
    httpOptions: any
  ): Observable<User> {
    const storedUserData = localStorage.getItem('pendingUserData');
    console.log('Stored user data:', storedUserData);
    if (!storedUserData) {
      return throwError(() => new Error('No pending user data found'));
    }

    const userData = JSON.parse(storedUserData);
    console.log('Parsed User Data:', userData);

    // First check if login exists
    return this.http
      .get<LoginResponse>(`${this.apiurl}/Login/${credentials.userId}`)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            // Login doesn't exist, create it
            const loginDTO: LoginDTO = {
              userId: credentials.userId,
              password: credentials.password,
              userNum: userData.userNum,
            };
            console.log('Login DTO:', loginDTO);
            return this.http.post<LoginResponse>(
              `${this.apiurl}/Login`,
              loginDTO,
              httpOptions
            );
          }
          return throwError(() => error);
        }),
        // After login check/creation, get user data
        switchMap(() =>
          this.http.get<User>(`${this.apiurl}/User/${userData.userNum}`)
        ),
        tap((user) => {
          localStorage.setItem('userId', credentials.userId);
          localStorage.setItem('userNum', userData.userNum.toString());
          localStorage.setItem('isAdmin', userData.isAdmin.toString());
          localStorage.removeItem('pendingUserData');
          this.updateStoredUserData(user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }
  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  getCurrrentUserNum(): number | null {
    const userNum = localStorage.getItem('userNum');
    return userNum ? parseInt(userNum, 10) : null;
  }
  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }
}
