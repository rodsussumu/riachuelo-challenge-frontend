import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserLoginResponse, UserRegisterResponse, UserRequest } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(userRequest: UserRequest): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.apiUrl}/login`, userRequest);
  }

  register(userRequest: UserRequest): Observable<UserRegisterResponse> {
    return this.http.post<UserRegisterResponse>(`${this.apiUrl}/register`, userRequest);
  }

  checkAuth() {
    return this.http.get<UserLoginResponse>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
