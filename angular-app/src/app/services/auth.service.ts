import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/usuario';

  constructor(private http: HttpClient) { }

  /**
   * Login - Fase 1: Validar credenciales y enviar código 2FA
   */
  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, password });
  }

  /**
   * Verificar código 2FA - Fase 2: Completar login
   */
  verify2FA(id_usuario: number, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { id_usuario, codigo });
  }

  /**
   * Reenviar código 2FA
   */
  resendCode(id_usuario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-code`, { id_usuario });
  }

  /**
   * Registrar nuevo usuario
   */
  register(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, usuario);
  }
}