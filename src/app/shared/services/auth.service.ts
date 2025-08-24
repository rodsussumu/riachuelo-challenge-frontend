import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserRequest {
  username: string;
  password: string;
}
export interface UserLoginResponse {
  authenticated: boolean;
  username?: string;
}
export interface UserRegisterResponse {
  username: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = `${environment.apiUrl}/auth`;
  private storageKey = 'username';

  constructor(private http: HttpClient) {}

  login(body: UserRequest): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.apiUrl}/login`, body, {
      withCredentials: true,
    });
  }

  register(body: UserRequest): Observable<UserRegisterResponse> {
    return this.http.post<UserRegisterResponse>(`${this.apiUrl}/register`, body, {
      withCredentials: true,
    });
  }

  checkAuth(): Observable<boolean> {
    return this.http.get<UserLoginResponse>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.clearUsername()));
  }

  setUsername(name: string) {
    try {
      localStorage.setItem(this.storageKey, name ?? '');
    } catch {}
  }
  getUsername(): string {
    try {
      return localStorage.getItem(this.storageKey) ?? '';
    } catch {
      return '';
    }
  }
  clearUsername() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {}
  }
}
