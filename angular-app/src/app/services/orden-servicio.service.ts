import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface OrdenServicio {
  id_orden: string;
  numero_orden: string;
  id_usuario: string;
  id_vehiculo: string;
  id_oficina?: string;
  tipo_servicio: string;
  descripcion_problema?: string;
  diagnostico_tecnico?: string;
  fecha_solicitud: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  subtotal_mano_obra: number;
  subtotal_repuestos: number;
  subtotal: number;
  iva: number;
  total: number;
  estado: string;
  metodo_pago?: string;
  estado_pago: string;
  calificacion?: number;
  comentario_cliente?: string;
  vehiculo?: any;
  oficina?: any;
  detalles?: any[];
}

export interface CrearOrdenData {
  id_usuario: string;
  id_vehiculo: string;
  tipo_servicio?: string;
  descripcion_problema?: string;
  servicios: { id_servicio: string; cantidad: number }[];
  repuestos?: { id_repuesto: string; cantidad: number }[];
  id_oficina?: string;
  id_cita?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenServicioService {
  private apiUrl = `http://localhost:3000/api/ordenes-servicio`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ========================================
  // CREAR ORDEN DE SERVICIO
  // ========================================
  crearOrden(data: CrearOrdenData): Observable<any> {
    return this.http.post(this.apiUrl, data, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // OBTENER ÓRDENES DEL USUARIO
  // ========================================
  getOrdenesByUsuario(id_usuario: string): Observable<OrdenServicio[]> {
    return this.http.get<OrdenServicio[]>(`${this.apiUrl}/usuario/${id_usuario}`, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // OBTENER ORDEN POR ID
  // ========================================
  getOrdenById(id: string): Observable<OrdenServicio> {
    return this.http.get<OrdenServicio>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // PROCESAR PAGO
  // ========================================
  procesarPago(id_orden: string, data: { id_tarjeta: string; metodo_pago: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id_orden}/pago`, data, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // CANCELAR ORDEN
  // ========================================
  cancelarOrden(id: string, motivo: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancelar`, { motivo }, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // CALIFICAR SERVICIO
  // ========================================
  calificarServicio(id: string, calificacion: number, comentario: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/calificar`, { calificacion, comentario }, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // OBTENER TODAS LAS ÓRDENES (ADMIN)
  // ========================================
  getAllOrdenes(filtros?: any): Observable<OrdenServicio[]> {
    let url = this.apiUrl;
    if (filtros) {
      const params = new URLSearchParams(filtros).toString();
      url += `?${params}`;
    }
    return this.http.get<OrdenServicio[]>(url, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // ACTUALIZAR ESTADO (ADMIN)
  // ========================================
  updateEstado(id: string, estado: string, diagnostico_tecnico?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado, diagnostico_tecnico }, {
      headers: this.getHeaders()
    });
  }
}