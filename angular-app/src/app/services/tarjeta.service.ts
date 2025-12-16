import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Tarjeta {
  id_tarjeta: string;
  id_usuario: string;
  numero: string;
  nombre: string;
  vencimiento: string;
  tipo: string;
  saldo: number;
}

@Injectable({
  providedIn: 'root'
})
export class TarjetaService {
  private apiUrl = `${environment.apiUrl}/tarjetas`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener tarjetas del usuario
  getTarjetasByUsuario(id_usuario: string): Observable<Tarjeta[]> {
    return this.http.get<Tarjeta[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // Obtener tarjeta por ID
  getById(id_tarjeta: string): Observable<Tarjeta> {
    return this.http.get<Tarjeta>(`${this.apiUrl}/${id_tarjeta}`, {
      headers: this.getHeaders()
    });
  }

  // Crear tarjeta
  create(tarjeta: any): Observable<any> {
    return this.http.post(this.apiUrl, tarjeta, {
      headers: this.getHeaders()
    });
  }

  // Recargar saldo
  recargarSaldo(id_tarjeta: string, monto: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id_tarjeta}/recargar`, { monto }, {
      headers: this.getHeaders()
    });
  }

  // Eliminar tarjeta
  delete(id_tarjeta: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id_tarjeta}`, {
      headers: this.getHeaders()
    });
  }
}