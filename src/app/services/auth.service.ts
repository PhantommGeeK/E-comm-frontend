import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse } from '../model/Auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly tokenStorageKey = 'ecom-auth-token';
  private readonly authStateSubject = new BehaviorSubject<boolean>(false);

  readonly authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.authStateSubject.next(!!this.getToken());
  }

  signup(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, payload);
  }

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.setSession(response))
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.tokenStorageKey);
    }

    this.authStateSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(this.tokenStorageKey);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub ?? null;
    } catch {
      return null;
    }
  }

  private setSession(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.tokenStorageKey, response.token);
    }

    this.authStateSubject.next(true);
  }
}