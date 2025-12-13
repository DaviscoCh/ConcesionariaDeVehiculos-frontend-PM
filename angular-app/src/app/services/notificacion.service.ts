import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { switchMap, startWith } from 'rxjs/operators';

export interface Notificacion {
  id_notificacion: string;
  id_usuario: string;
  id_cita: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  fecha_cita?: string;
  hora_cita?: string;
  nombre_oficina?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:3000/api/notificaciones';
  private contadorSubject = new BehaviorSubject<number>(0);
  public contador$ = this.contadorSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Actualizar contador cada 30 segundos SOLO si hay token
    if (isPlatformBrowser(this.platformId)) {
      interval(30000).pipe(
        startWith(0),
        switchMap(() => {
          // Verificar si hay token antes de hacer la petición
          const token = localStorage.getItem('token');
          if (token) {
            return this.getContador();
          } else {
            // Si no hay token, retornar observable con valor 0
            return new Observable<{ total: number }>(observer => {
              observer.next({ total: 0 });
              observer.complete();
            });
          }
        })
      ).subscribe({
        next: (response: { total: number }) => this.contadorSubject.next(response.total),
        error: (error) => {
          // Solo mostrar error si NO es 401 (no autenticado es normal)
          if (error.status !== 401) {
            console.error('Error al obtener contador:', error);
          }
        }
      });
    }
  }

  // ---------------------------------------------
  //  OBTENER TODAS LAS NOTIFICACIONES
  // ---------------------------------------------
  getNotificaciones(): Observable<Notificacion[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Notificacion[]>(this.apiUrl, { headers });
  }

  // ---------------------------------------------
  //  OBTENER CONTADOR DE NO LEÍDAS
  // ---------------------------------------------
  getContador(): Observable<{ total: number }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ total: number }>(`${this.apiUrl}/contador`, { headers });
  }

  // ---------------------------------------------
  //  MARCAR COMO LEÍDA
  // ---------------------------------------------
  marcarComoLeida(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/leida`, {}, { headers });
  }

  // ---------------------------------------------
  //  MARCAR TODAS COMO LEÍDAS
  // ---------------------------------------------
  marcarTodasLeidas(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/marcar-todas-leidas`, {}, { headers });
  }

  // ---------------------------------------------
  //  ELIMINAR NOTIFICACIÓN
  // ---------------------------------------------
  eliminarNotificacion(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  // ---------------------------------------------
  //  ACTUALIZAR CONTADOR MANUALMENTE
  // ---------------------------------------------
  actualizarContador(): void {
    this.getContador().subscribe(
      response => this.contadorSubject.next(response.total),
      error => console.error('Error al actualizar contador:', error)
    );
  }

  // ---------------------------------------------
  //  OBTENER HEADERS CON TOKEN
  // ---------------------------------------------
  private getAuthHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
      }
    }
    return new HttpHeaders();
  }
}