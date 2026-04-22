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
  private readonly roleStorageKey = 'ecom-auth-role';
  private readonly authStateSubject = new BehaviorSubject<boolean>(false);
  private readonly roleSubject = new BehaviorSubject<string | null>(null);

  readonly authState$ = this.authStateSubject.asObservable();
  readonly role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {
    this.authStateSubject.next(!!this.getToken());
    this.roleSubject.next(this.getRole());
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
      window.localStorage.removeItem(this.roleStorageKey);
    }

    this.authStateSubject.next(false);
    this.roleSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN';
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(this.tokenStorageKey);
  }

  getUsername(): string | null {
    return this.getTokenPayload()?.['sub'] ?? null;
  }

  getRole(): string | null {
    if (typeof window !== 'undefined') {
      const storedRole = window.localStorage.getItem(this.roleStorageKey);
      if (storedRole) {
        return storedRole;
      }
    }

    return this.getTokenPayload()?.['role'] ?? null;
  }

  private setSession(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.tokenStorageKey, response.token);
      window.localStorage.setItem(this.roleStorageKey, response.role);
    }

    this.authStateSubject.next(true);
    this.roleSubject.next(response.role);
  }

  private getTokenPayload(): Record<string, string> | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}