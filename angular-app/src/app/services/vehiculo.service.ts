import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = 'http://localhost:3000/api/vehiculos';

  constructor(private http: HttpClient) { }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerVehiculoPorId(id: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/vehiculos/${id}`);
  }

  getVehiculosFiltrados(filtros: any): Observable<any[]> {
    let params = new URLSearchParams();

    // Solo agregar parámetros que tengan valor
    if (filtros.marca) params.append('marca', filtros.marca);
    if (filtros.modelo) params.append('modelo', filtros.modelo);
    if (filtros.anio) params.append('anio', filtros.anio.toString());
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.color) params.append('color', filtros.color);
    if (filtros.precioMin) params.append('precioMin', filtros.precioMin.toString());
    if (filtros.precioMax) params.append('precioMax', filtros.precioMax.toString());
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.stock) params.append('stock', 'true');
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

    const queryString = params.toString();
    const url = queryString ? `${this.apiUrl}/filtrar?${queryString}` : `${this.apiUrl}/filtrar`;

    return this.http.get<any[]>(url);
  }

}
