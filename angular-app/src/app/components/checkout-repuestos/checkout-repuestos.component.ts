import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RepuestoService, ItemCarrito } from '../../services/repuesto.service';
import { UsuarioService } from '../../services/usuario.service';
import Swal from 'sweetalert2'; // ✅ IMPORTAR

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
        this.tarjetas = response.tarjetas || [];
        console.log('Tarjetas cargadas:', this.tarjetas);
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
    // ✅ Validación 1: Tarjeta seleccionada
    if (!this.tarjetaSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Tarjeta no seleccionada',
        text: 'Por favor selecciona una tarjeta para continuar',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const tarjeta = this.tarjetas.find(t => t.id_tarjeta === this.tarjetaSeleccionada);

    // ✅ Validación 2: Tarjeta válida
    if (!tarjeta) {
      Swal.fire({
        icon: 'error',
        title: 'Tarjeta no válida',
        text: 'La tarjeta seleccionada no es válida',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // ✅ Validación 3: Saldo suficiente
    if (parseFloat(tarjeta.saldo) < this.obtenerTotal()) {
      Swal.fire({
        icon: 'error',
        title: 'Saldo insuficiente',
        html: `
          <p>No tienes saldo suficiente en esta tarjeta. </p>
          <p class="mb-2"><strong>Saldo disponible:</strong> $${parseFloat(tarjeta.saldo).toFixed(2)}</p>
          <p><strong>Total a pagar:</strong> $${this.obtenerTotal().toFixed(2)}</p>
        `,
        confirmButtonColor: '#d33'
      });
      return;
    }

    // ✅ Confirmación de compra
    const resultado = await Swal.fire({
      title: '¿Confirmar compra?',
      html: `
        <div class="text-start">
          <p class="mb-2"><strong>Total a pagar:</strong> <span class="text-primary fs-4">$${this.obtenerTotal().toFixed(2)}</span></p>
          <p class="mb-0">Se cobrará de tu tarjeta: </p>
          <p class="text-muted">**** **** **** ${tarjeta.numero.slice(-4)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ Confirmar',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    });

    if (!resultado.isConfirmed) return;

    // ✅ Procesar pago
    this.procesando = true;
    this.error = '';

    try {
      for (const item of this.carrito) {
        await this.procesarCompraItem(item);
      }

      // ✅ Éxito
      this.repuestoService.vaciarCarrito();

      await Swal.fire({
        icon: 'success',
        title: '¡Compra realizada exitosamente!',
        html: `
          <p class="mb-2">Tu pedido ha sido procesado correctamente.</p>
          <p class="text-muted">Total pagado: <strong>$${this.obtenerTotal().toFixed(2)}</strong></p>
        `,
        confirmButtonText: 'Ver Historial',
        confirmButtonColor: '#3085d6',
        timer: 3000,
        timerProgressBar: true
      });

      this.router.navigate(['/historial-compras']);

    } catch (error: any) {
      console.error('Error al procesar pago:', error);

      // ✅ Error
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar el pago',
        text: error.error?.error || 'Ocurrió un error inesperado.  Por favor intenta nuevamente.',
        confirmButtonColor: '#d33'
      });

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