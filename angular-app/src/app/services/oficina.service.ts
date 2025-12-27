import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';  // ← AGREGAR ESTO

@Injectable({
  providedIn: 'root'
})
export class OficinaService {
  private apiUrl = `${environment.apiUrl}/oficinas`;  // ← CAMBIAR ESTO

  constructor(private http: HttpClient) { }

  obtenerOficinas() {
    return this.http.get(this.apiUrl);
  }
}