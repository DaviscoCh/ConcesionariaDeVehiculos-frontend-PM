import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-historial-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-citas.component.html',
  styleUrl: './historial-citas.component.css'
})
export class HistorialCitasComponent implements OnInit {
  error = '';
  today = new Date().toISOString().slice(0, 10);
  citas: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:3000/api/citas/historial', { headers })
      .subscribe({
        next: (res) => {
          console.log('Citas recibidas:', res);
          this.citas = res;
        },
        error: (err) => {
          console.error('Error al cargar historial de citas:', err);
          this.error = 'No se pudo cargar el historial de citas.';
        }
      });
  }
}
