import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OficinaService {
private apiUrl = 'http://localhost:3000/api/oficinas';

  constructor(private http: HttpClient) {}

  obtenerOficinas() {
    return this.http.get(this.apiUrl);
  }
}
