import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';  // ← AGREGAR ESTO

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private apiUrl = `${environment.apiUrl}/marcas`;  // ← CAMBIAR ESTO

  constructor(private http: HttpClient) { }

  // Obtener todas las marcas
  obtenerTodas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Obtener marca por ID
  obtenerPorId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Obtener vehículos por marca
  obtenerVehiculosPorMarca(id_marca: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/vehiculos/marca/${id_marca}`);  // ← CAMBIAR ESTO
  }
}