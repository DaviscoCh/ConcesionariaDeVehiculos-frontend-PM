import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interfaz para el mejor horario disponible
interface MejorHorario {
  id_oficina: string;
  fecha: string;
  hora: string;
  nombre_oficina: string;
  direccion_oficina: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = 'http://localhost:3000/api/citas';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  crearCita(cita: any) {
    return this.http.post(`${this.apiUrl}`, cita, this.getAuthHeaders());
  }

  obtenerCitas() {
    return this.http.get(this.apiUrl);
  }

  obtenerHistorialUsuario() {
    return this.http.get(`${this.apiUrl}/historial`, this.getAuthHeaders());
  }

  // ✅ NUEVO: Obtener el mejor horario disponible (para autocompletar)
  obtenerMejorHorarioDisponible(): Observable<MejorHorario> {
    return this.http.get<MejorHorario>(`${this.apiUrl}/mejor-horario`);
  }

  // Verificar disponibilidad de un horario específico
  verificarDisponibilidad(fecha: string, hora: string, id_oficina: string) {
    const params = { fecha, hora, id_oficina };
    return this.http.get<{ disponible: boolean }>(`${this.apiUrl}/disponibilidad`, { params });
  }

  obtenerHorasOcupadas(fecha: string, id_oficina: string) {
    const params = { fecha, id_oficina };
    return this.http.get<{ horas: string[] }>(`${this.apiUrl}/horas-ocupadas`, { params });
  }

  // Obtener horarios disponibles de una oficina en una fecha
  obtenerHorariosDisponibles(fecha: string, id_oficina: string) {
    const params = { fecha, id_oficina };
    return this.http.get<{ disponible: boolean; horarios: string[] }>(`${this.apiUrl}/disponibilidad`, { params });
  }
}