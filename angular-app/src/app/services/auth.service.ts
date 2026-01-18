import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // ✅ Importar environment

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/usuario`; // ✅ Usar environment

  constructor(private http: HttpClient) { }

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, password });
  }

  verify2FA(id_usuario: number, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { id_usuario, codigo });
  }

  resendCode(id_usuario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-code`, { id_usuario });
  }

  register(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, usuario);
  }
}