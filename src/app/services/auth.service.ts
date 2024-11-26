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
    // if (!userId) {
    //   console.log('No userId found, completing logout');
    //   this.clearLocalStorage();
    //   return of(void 0);
    // }

    // return this.http.delete<void>(`${this.apiurl}/Login/${userId}`).pipe(
    //   tap(() => {
    //     console.log('Successfully deleted login session');
    //     this.clearLocalStorage();
    //     this.isAuthenticatedSubject.next(false);
    //   }),
    //   catchError((error) => {
    //     console.error('Logout API error:', error);

    //     if (error.status === 404) {
    //       // Session already gone, just clear local state
    //       console.log('Login session not found, clearing local state');
    //       this.clearLocalStorage();
    //       return of(void 0);
    //     }

    //     return throwError(() => error);
    //   })
    // );
  }

  authenticate(credentials: LoginCredentials): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };

    // // First check if user exists by userId
    // return this.http
    //   .get<User[]>(`${this.apiurl}/User/${credentials.userId}`)
    //   .pipe(
    //     switchMap((users) => {
    //       if (users && users.length > 0) {
    //         // User exists, create login
    //         const existingUser = users[0];
    //         console.log('Found existing user:', existingUser);

    //         const loginDTO: LoginDTO = {
    //           userId: credentials.userId,
    //           password: credentials.password,
    //           userNum: existingUser.userNum,
    //         };

    //         return this.http
    //           .post<LoginResponse>(
    //             `${this.apiurl}/Login`,
    //             loginDTO,
    //             httpOptions
    //           )
    //           .pipe(
    //             tap(() => {
    //               localStorage.setItem('userId', credentials.userId);
    //               localStorage.setItem(
    //                 'userNum',
    //                 existingUser.userNum.toString()
    //               );
    //               localStorage.setItem(
    //                 'isAdmin',
    //                 existingUser.isAdmin.toString()
    //               );
    //               this.updateStoredUserData(existingUser);
    //               this.isAuthenticatedSubject.next(true);
    //             }),
    //             map(() => existingUser)
    //           );
    //       } else {
    //         // User doesn't exist, create new user then login
    //         console.log('User not found, creating new user');
    //         return this.createNewUserAndLogin(credentials, httpOptions);
    //       }
    //     }),
    //     catchError((error) => {
    //       console.error('Authentication error:', error);
    //       return throwError(() => error);
    //     })
    //   );

    // WORKING CODE BELOW THIS LINE

    // const userDto: UserDTO = {
    //   userNum: this.generateRandomUserNum(), // Use the unique userNum
    //   firstName: 'FirstName',
    //   middleName: '',
    //   lastName: 'LastName',
    //   birthday: '2000-01-01',
    //   socialInsuranceNum: '123456789',
    //   email: 'default@example.com',
    //   phoneNum: '1234567890',
    //   streetAddress: '1234 Example St',
    //   city: 'Example City',
    //   province: 'ON',
    //   postalCode: 'A1A1A1',
    //   isAdmin: false,
    // };

    // //Create new user first
    // return this.http.post<User>(`${this.apiurl}/User`, userDto).pipe(
    //   switchMap((user) => {
    //     const loginDTO: LoginDTO = {
    //       userId: credentials.userId,
    //       password: credentials.password,
    //       userNum: user.userNum,
    //     };

    //     console.log(
    //       'PUT Request URL:',
    //       `${this.apiurl}/Login/${loginDTO.userNum}`
    //     );
    //     console.log('PUT Request Payload:', loginDTO);

    //     return this.http
    //       .post<User>(`${this.apiurl}/Login`, loginDTO, httpOptions)
    //       .pipe(map(() => user));
    //   }),
    //   tap((user) => {
    //     localStorage.setItem('userId', credentials.userId);
    //     localStorage.setItem('userNum', user.userNum.toString());
    //     localStorage.setItem('isAdmin', user.isAdmin.toString());
    //     this.updateStoredUserData(user);
    //     this.isAuthenticatedSubject.next(true);
    //   }),
    //   catchError((error) => {
    //     console.error('Authentication error:', error);
    //     return throwError(() => error);
    //   })
    // );

    return this.http
      .get<LoginDTO>(`${this.apiurl}/Login/${credentials.userId}`)
      .pipe(
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
          if (error.status === 404) {
            console.log('Login not found, creating new user');
            return this.checkAndCreateUser(credentials, httpOptions);
          }
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
    localStorage.removeItem('userId');
    localStorage.removeItem('userNum');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userData');
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
    const userDto: UserDTO = {
      userNum: this.generateRandomUserNum(), // Use the unique userNum
      firstName: 'FirstName',
      middleName: '',
      lastName: 'LastName',
      birthday: '2000-01-01',
      socialInsuranceNum: '123456789',
      email: 'default@example.com',
      phoneNum: '1234567890',
      streetAddress: '1234 Example St',
      city: 'Example City',
      province: 'ON',
      postalCode: 'A1A1A1',
      isAdmin: false,
    };
    return this.http.post<User>(`${this.apiurl}/User`, userDto).pipe(
      switchMap((newUser) => {
        console.log('New user created:', newUser);

        const loginDTO: LoginDTO = {
          userId: credentials.userId,
          password: credentials.password,
          userNum: newUser.userNum,
        };
        if (newUser.isAdmin) {
          this.adminStateService.setAdminStatus(true);
        } else {
          this.adminStateService.setAdminStatus(false);
        }

        return this.http
          .post<LoginResponse>(`${this.apiurl}/Login`, loginDTO, httpOptions)
          .pipe(
            tap(() => {
              localStorage.setItem('userId', credentials.userId);
              localStorage.setItem('userNum', newUser.userNum.toString());
              localStorage.setItem('isAdmin', newUser.isAdmin.toString());
              this.updateStoredUserData(newUser);
              this.isAuthenticatedSubject.next(true);
            }),
            map(() => newUser)
          );
      }),
      catchError((error) => {
        console.error('Error creating new user and login:', error);
        return throwError(() => error);
      })
    );

    // WORKING CODE BELOW THIS LINE
    // const generateUniqueUserNum = (): Observable<number> => {
    //   const randomUserNum = this.generateRandomUserNum();
    //   return this.http.get<User>(`${this.apiurl}/User/${randomUserNum}`).pipe(
    //     switchMap(() => {
    //       return generateUniqueUserNum();
    //     }),
    //     catchError((error) => {
    //       if (error.status === 404) {
    //         console.log('Unique userNum found:', randomUserNum);
    //         return of(randomUserNum);
    //       }
    //       return throwError(() => error);
    //     })
    //   );
    // };
    // return generateUniqueUserNum().pipe(
    //   switchMap((uniqueUserNum) => {
    //     const userDto: UserDTO = {
    //       userNum: uniqueUserNum, // Use the unique userNum
    //       firstName: 'FirstName',
    //       middleName: '',
    //       lastName: 'LastName',
    //       birthday: '2000-01-01',
    //       socialInsuranceNum: '123456789',
    //       email: 'default@example.com',
    //       phoneNum: '1234567890',
    //       streetAddress: '1234 Example St',
    //       city: 'Example City',
    //       province: 'ON',
    //       postalCode: 'A1A1A1',
    //       isAdmin: false,
    //     };
    //     return this.http.post<User>(`${this.apiurl}/User`, userDto).pipe(
    //       switchMap((newUser) => {
    //         console.log('New user created:', newUser);
    //         if (!newUser || !newUser.userNum) {
    //           console.error('User creation failed or userNum is missing');
    //           return throwError(() => new Error('User creation failed'));
    //         }
    //         const loginDTO: LoginDTO = {
    //           userId: credentials.userId,
    //           password: credentials.password,
    //           userNum: newUser.userNum,
    //         };
    //         console.log('Creating login with:', loginDTO);
    //         return this.http
    //           .post<LoginResponse>(
    //             `${this.apiurl}/Login`,
    //             loginDTO,
    //             httpOptions
    //           )
    //           .pipe(
    //             tap((loginResponse) => {
    //               console.log('Login response:', loginResponse);
    //               localStorage.setItem('userId', credentials.userId);
    //               localStorage.setItem('userNum', newUser.userNum.toString());
    //               localStorage.setItem('isAdmin', newUser.isAdmin.toString());
    //               this.updateStoredUserData(newUser);
    //               this.isAuthenticatedSubject.next(true);
    //             }),
    //             map(() => newUser)
    //           );
    //       }),
    //       catchError((error) => {
    //         console.error('Error creating new user and login:', error);
    //         return throwError(() => error);
    //       })
    //     );
    //   })
    // );

    // const userDto: UserDTO = {
    //   firstName: 'FirstName',
    //   middleName: '',
    //   lastName: 'LastName',
    //   birthday: '2000-01-01',
    //   socialInsuranceNum: '123456789',
    //   email: 'default@example.com',
    //   phoneNum: '1234567890',
    //   streetAddress: '1234 Example St',
    //   city: 'Example City',
    //   province: 'ON',
    //   postalCode: 'A1A1A1',
    //   isAdmin: false,
    // };
    // return this.http.post<User>(`${this.apiurl}/User`, userDto).pipe(
    //   switchMap((newUser) => {
    //     console.log('New user created:', newUser);
    //     if (!newUser || !newUser.userNum) {
    //       console.error('User creation failed or userNum is missing');
    //       return throwError(() => new Error('User creation failed'));
    //     }
    //     const loginDTO: LoginDTO = {
    //       userId: credentials.userId,
    //       password: credentials.password,
    //       userNum: newUser.userNum,
    //     };

    //     console.log(
    //       'PUT Request URL:',
    //       `${this.apiurl}/Login/${loginDTO.userNum}`
    //     );
    //     console.log('PUT Request Payload:', loginDTO);

    //     return this.http
    //       .post<LoginResponse>(`${this.apiurl}/Login`, loginDTO, httpOptions)
    //       .pipe(
    //         tap((loginResponse) => {
    //           console.log('Login created:', loginResponse);
    //           localStorage.setItem('userId', credentials.userId);
    //           localStorage.setItem('userNum', newUser.userNum.toString());
    //           localStorage.setItem('isAdmin', newUser.isAdmin.toString());
    //           this.updateStoredUserData(newUser);
    //           this.isAuthenticatedSubject.next(true);
    //         }),
    //         map(() => newUser)
    //       );
    //   }),

    //   catchError((error) => {
    //     console.error('Authentication error:', error);
    //     return throwError(() => error);
    //   })
    // );
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
