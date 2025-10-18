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
}
