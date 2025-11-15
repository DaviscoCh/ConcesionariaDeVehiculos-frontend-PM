import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = 'http://localhost:3000/api/citas';

  constructor(private http: HttpClient) { }

  crearCita(cita: any) {
    return this.http.post('http://localhost:3000/api/citas', cita, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  obtenerCitas() {
    return this.http.get(this.apiUrl);
  }

  verificarDisponibilidad(fecha: string, hora: string, id_oficina: string) {
    const params = { fecha, hora, id_oficina };
    return this.http.get<{ disponible: boolean }>('http://localhost:3000/api/citas/disponibilidad', { params });
  }

  obtenerHorasOcupadas(fecha: string, id_oficina: string) {
    const params = { fecha, id_oficina };
    return this.http.get<{ horas: string[] }>('http://localhost:3000/api/citas/horas-ocupadas', { params });
  }
}
