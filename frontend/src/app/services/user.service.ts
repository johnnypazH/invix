import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  objetivoMensal?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private unwrap<T>(response: any): T {
    let current = response;
    let depth = 0;
    while (current && typeof current === 'object' && 'data' in current && depth < 5) {
      current = current.data;
      depth++;
    }
    return current ?? response;
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map((response) => this.unwrap<UserProfile>(response))
    );
  }

  updateProfile(profileData: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, profileData).pipe(
      map((response) => this.unwrap(response))
    );
  }
}
