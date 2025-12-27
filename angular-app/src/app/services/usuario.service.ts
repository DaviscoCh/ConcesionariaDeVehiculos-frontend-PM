import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environment';  // ← AGREGAR ESTO

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;  // ← CAMBIAR ESTO
  private autenticado = new BehaviorSubject<boolean>(this.isAuthenticated());
  autenticado$ = this.autenticado.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, usuario);
  }

  loginUsuario(datos: any): Observable<any> {
    // 🚫 Bloquear correos de administradores ANTES de enviar al backend
    const correoAdmin = "admin@admin.com"; // AJÚSTALO AL QUE USAS

    if (datos.correo === correoAdmin) {
      return new Observable((observer) => {
        observer.error({ mensaje: "No autorizado para iniciar sesión en esta sección." });
      });
    }

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

        // ✅ Redirección de admin basada en el entorno
        if (response.rol === 'admin') {
          if (environment.production) {
            // En producción: redirigir a /admin (mismo dominio, diferente app)
            window.location.href = '/admin/dashboard';
          } else {
            // En desarrollo: redirigir al puerto de React
            window.location.href = 'http://localhost:3001/admin/dashboard';
          }
        }
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
    const url = `${environment.apiUrl}/personas/buscar?correo=${encodeURIComponent(correo)}`;  // ← CAMBIAR ESTO
    return this.http.get(url);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }

    this.autenticado.next(false);
  }

  // ✅ CORREGIDO: Verificar si estamos en el navegador antes de acceder a localStorage
  private getAuthHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
      }
    }
    // Si estamos en el servidor o no hay token, retornar headers vacíos
    return new HttpHeaders();
  }

  isLogged(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem('token');
  }

  actualizarEstado(): void {
    const estado = this.isAuthenticated();
    this.autenticado.next(estado);
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // ⛔ Validar que no sea admin
      if (payload.rol === 'admin') {
        return false; // Un admin NO puede entrar a Angular
      }

      const exp = payload.exp * 1000;
      return exp > Date.now();
    } catch {
      return false;
    }
  }
}