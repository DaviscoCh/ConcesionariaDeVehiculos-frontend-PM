import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ServicioMantenimiento {
  id_servicio: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_mano_obra: number;
  tiempo_estimado: number;
  requiere_repuestos: boolean;
  estado: string;
  imagen_url?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioMantenimientoService {
  private apiUrl = `${environment.apiUrl}/servicios-mantenimiento`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ========================================
  // OBTENER TODOS LOS SERVICIOS
  // ========================================
  getAll(): Observable<ServicioMantenimiento[]> {
    return this.http.get<ServicioMantenimiento[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // OBTENER CATEGORÍAS
  // ========================================
  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categorias`, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // OBTENER SERVICIOS POR CATEGORÍA
  // ========================================
  getByCategoria(categoria: string): Observable<ServicioMantenimiento[]> {
    return this.http.get<ServicioMantenimiento[]>(`${this.apiUrl}/categoria/${categoria}`, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // OBTENER SERVICIO POR ID
  // ========================================
  getById(id: string): Observable<ServicioMantenimiento> {
    return this.http.get<ServicioMantenimiento>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // CREAR SERVICIO (ADMIN)
  // ========================================
  create(servicio: any): Observable<any> {
    return this.http.post(this.apiUrl, servicio, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // ACTUALIZAR SERVICIO (ADMIN)
  // ========================================
  update(id: string, servicio: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, servicio, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // ELIMINAR SERVICIO (ADMIN)
  // ========================================
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}