import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient, private router: Router) {}

  // O backend nos devolverá { token: 'jwt...', user: { id: 'uuid...' } }
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('invix_token', res.token);
          localStorage.setItem('invix_user_id', res.user.id);
        }
      })
    );
  }

  // O backend deve criar o usuário e já nos devolver { token: 'jwt...', user: { id: 'uuid...' } }
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, { name, email, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('invix_token', res.token);
          localStorage.setItem('invix_user_id', res.user.id);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('invix_token');
    localStorage.removeItem('invix_user_id');
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('invix_token');
  }

  getUserId(): string | null {
    return localStorage.getItem('invix_user_id');
  }
}