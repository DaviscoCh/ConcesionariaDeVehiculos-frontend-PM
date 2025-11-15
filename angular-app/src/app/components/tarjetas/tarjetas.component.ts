import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tarjetas',
  standalone: false,
  templateUrl: './tarjetas.component.html',
  styleUrl: './tarjetas.component.css',
})
export class TarjetasComponent implements OnInit {
  tarjetas: any[] = [];
  nuevaTarjeta = {
    numero: '',
    nombre: '',
    vencimiento: '',
    cvv: '',
    tipo: 'prepago'
  };
  recarga = {
    id_tarjeta: '',
    monto: 0
  };
  mensaje = '';
  error = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarTarjetas();
  }

  cargarTarjetas(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:3000/api/tarjetas', { headers }).subscribe({
      next: (res) => this.tarjetas = res.tarjetas,
      error: (err) => console.error('Error al cargar tarjetas:', err)
    });
  }

  agregarTarjeta(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post<any>('http://localhost:3000/api/tarjetas', this.nuevaTarjeta, { headers }).subscribe({
      next: (res) => {
        this.mensaje = res.mensaje;
        this.nuevaTarjeta = { numero: '', nombre: '', vencimiento: '', cvv: '', tipo: 'prepago' };
        this.cargarTarjetas();
      },
      error: (err) => this.error = 'Error al agregar tarjeta'
    });
  }

  recargarSaldo(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put<any>('http://localhost:3000/api/tarjetas/recargar', this.recarga, { headers }).subscribe({
      next: (res) => {
        this.mensaje = res.mensaje;
        this.recarga = { id_tarjeta: '', monto: 0 };
        this.cargarTarjetas();
      },
      error: (err) => this.error = 'Error al recargar saldo'
    });
  }
}
