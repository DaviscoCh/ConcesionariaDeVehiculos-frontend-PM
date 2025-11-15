import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cotizador',
  standalone: false,
  templateUrl: './cotizador.component.html',
  styleUrl: './cotizador.component.css'
})
export class CotizadorComponent implements OnInit {
  vehiculo: any;
  marca: string = '';
  modelo: string = '';
  tarjetas: any[] = [];
  id_tarjeta_seleccionada: string = '';

  constructor(private router: Router, private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    this.vehiculo = navigation?.extras?.state?.['vehiculo'] || history.state?.vehiculo;

    const marcaModelo = this.route.snapshot.paramMap.get('marca-modelo');
    if (marcaModelo) {
      const partes = marcaModelo.split('-');
      this.marca = partes[0];
      this.modelo = partes.slice(1).join('-');
      this.cargarTarjetas();
    }

    if (!this.vehiculo) {
      console.warn('No se recibió vehículo, redirigiendo...');
      this.router.navigate(['/vehiculos']);
    }
  }


  comprarVehiculo(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const datosCompra = {
      id_vehiculo: this.vehiculo.id_vehiculo,
      precio: this.vehiculo.precio,
      metodo_pago: 'tarjeta',
      comentario: 'Compra realizada desde cotizador',
      id_tarjeta: this.id_tarjeta_seleccionada
    };

    this.http.post('http://localhost:3000/api/facturas', datosCompra, { headers }).subscribe({
      next: (response: any) => {
        const saldo = response.saldoRestante;
        const saldoFormateado = typeof saldo === 'number' ? saldo.toFixed(2) : saldo;
        alert(`¡Compra realizada con éxito!\nSaldo restante: $${saldoFormateado}`);

        // Opcional: si tienes tarjetas en este componente, actualízalas
        this.cargarTarjetas?.(); // solo si existe

        this.router.navigate(['/perfil']);
      },
      error: (err: any) => {
        const mensaje = err?.error?.error || 'No se pudo realizar la compra';
        alert(mensaje);
      }
    });
  }

  cargarTarjetas(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:3000/api/tarjetas', { headers }).subscribe({
      next: (res) => this.tarjetas = res.tarjetas,
      error: (err) => console.error('Error al cargar tarjetas:', err)
    });
  }
}

