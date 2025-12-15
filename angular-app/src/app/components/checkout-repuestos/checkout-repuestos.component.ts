import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RepuestoService, ItemCarrito } from '../../services/repuesto.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-checkout-repuestos',
  standalone: false,
  templateUrl: './checkout-repuestos.component.html',
  styleUrl: './checkout-repuestos.component.css'
})
export class CheckoutRepuestosComponent implements OnInit {
  carrito: ItemCarrito[] = [];
  tarjetas: any[] = [];
  tarjetaSeleccionada: string = '';

  procesando = false;
  error = '';

  constructor(
    private repuestoService: RepuestoService,
    private usuarioService: UsuarioService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar autenticación
    if (!this.usuarioService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    // Obtener carrito
    this.carrito = this.repuestoService.obtenerCarrito();

    // Si el carrito está vacío, redirigir
    if (this.carrito.length === 0) {
      this.router.navigate(['/repuestos']);
      return;
    }

    // Cargar tarjetas del usuario
    this.cargarTarjetas();
  }

  cargarTarjetas() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/api/tarjetas', { headers }).subscribe({
      next: (response: any) => {
        // El backend devuelve { tarjetas: [...] }
        this.tarjetas = response.tarjetas || [];
        console.log('Tarjetas cargadas:', this.tarjetas); // Para verificar
      },
      error: err => {
        console.error('Error al cargar tarjetas:', err);
        this.error = 'No se pudieron cargar las tarjetas';
      }
    });
  }

  convertirANumero(valor: any): number {
    return Number(valor);
  }


  obtenerSubtotal(): number {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  obtenerIVA(): number {
    return this.obtenerSubtotal() * 0.15;
  }

  obtenerTotal(): number {
    return this.obtenerSubtotal() + this.obtenerIVA();
  }

  async procesarPago() {
    if (!this.tarjetaSeleccionada) {
      alert('Por favor selecciona una tarjeta');
      return;
    }

    const tarjeta = this.tarjetas.find(t => t.id_tarjeta === this.tarjetaSeleccionada);
    if (!tarjeta) {
      alert('Tarjeta no válida');
      return;
    }

    // Verificar saldo
    if (parseFloat(tarjeta.saldo) < this.obtenerTotal()) {
      alert('Saldo insuficiente en la tarjeta seleccionada');
      return;
    }

    const confirmar = confirm(
      `¿Confirmar compra por $${this.obtenerTotal().toFixed(2)}?\n\n` +
      `Se cobrará de tu tarjeta **** ${tarjeta.numero.slice(-4)}`
    );

    if (!confirmar) return;

    this.procesando = true;
    this.error = '';

    // Procesar cada item del carrito
    try {
      for (const item of this.carrito) {
        await this.procesarCompraItem(item);
      }

      // Éxito: limpiar carrito y redirigir
      this.repuestoService.vaciarCarrito();
      alert('¡Compra realizada exitosamente!');
      this.router.navigate(['/historial-compras']);

    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      this.error = error.error?.error || 'Error al procesar el pago';
      this.procesando = false;
    }
  }

  private procesarCompraItem(item: ItemCarrito): Promise<any> {
    return new Promise((resolve, reject) => {
      this.repuestoService.procesarCompra(
        item.id_repuesto,
        this.tarjetaSeleccionada,
        item.cantidad
      ).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });
  }

  volver() {
    this.router.navigate(['/repuestos']);
  }

  enmascaradoTarjeta(numero: string): string {
    return `**** **** **** ${numero.slice(-4)}`;
  }
}