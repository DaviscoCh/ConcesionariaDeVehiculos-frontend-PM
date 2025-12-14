import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = 'http://localhost:3000/api/facturas';

  constructor(private http: HttpClient) { }

  // Obtener headers con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener factura por ID
  obtenerFacturaPorId(id_factura: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id_factura}`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener factura por ID de cita
  obtenerFacturaPorCita(id_cita: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/cita/${id_cita}`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener historial de facturas del usuario
  obtenerHistorial(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/historial`,
      { headers: this.getHeaders() }
    );
  }
}