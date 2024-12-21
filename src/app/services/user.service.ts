import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDTO, UserLoginDTO } from '../interface/user';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5145/api/UserService';

  constructor(private http: HttpClient) {}

  createUser(userData: UserLoginDTO): Observable<UserLoginDTO> {
    return this.http.post<any>(this.apiUrl, userData).pipe(
      map((response) => {
        if (response.message) {
          return userData;
        }
        return response;
      })
    );
  }
}
