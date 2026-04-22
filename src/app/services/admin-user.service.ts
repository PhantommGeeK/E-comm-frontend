import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ManagedUser } from '../model/ManagedUser';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private readonly apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: number, role: string): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.apiUrl}/users/${userId}/role`, { role });
  }
}