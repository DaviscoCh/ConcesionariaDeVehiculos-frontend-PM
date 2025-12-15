import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private apiUrl = 'http://localhost:3000/api/marcas';

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
    return this.http.get(`http://localhost:3000/api/vehiculos/marca/${id_marca}`);
  }
}