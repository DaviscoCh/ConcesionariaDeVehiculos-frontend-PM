import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/api/usuario';
  private autenticado = new BehaviorSubject<boolean>(this.isAuthenticated());
  autenticado$ = this.autenticado.asObservable();

  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object) { }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, usuario);
  }

  loginUsuario(datos: any): Observable<any> {
    return this.http.post<{ token: string; rol: string; usuario: any }>(`${this.apiUrl}/login`, datos).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol);
          localStorage.setItem('nombre', response.usuario?.nombres ?? '');
          localStorage.setItem('apellido', response.usuario?.apellidos ?? '');
          localStorage.setItem('correo', response.usuario?.correo ?? '');
        }
        this.autenticado.next(true);
      })
    );
  }

  getPerfil(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/perfil`, { headers });
  }

  getCotizaciones(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/cotizaciones`, { headers });
  }

  obtenerPorCorreo(correo: string): Observable<any> {
    const url = `http://localhost:3000/api/personas/buscar?correo=${encodeURIComponent(correo)}`;
    return this.http.get(url);
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const rol = localStorage.getItem('rol');

      // Solo considerar autenticado si hay token y rol válido
      return !!token && (rol === 'usuario' || rol === 'admin');
    }
    return false;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol'); // ✅ esto es lo que faltaba
      localStorage.removeItem('nombre');
      localStorage.removeItem('apellido');
      localStorage.removeItem('correo');
    }
    this.autenticado.next(false);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  actualizarEstado(): void {
    this.autenticado.next(this.isAuthenticated());
  }
}
