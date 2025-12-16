import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdenServicioService } from '../../services/orden-servicio.service';
import { FacturaService } from '../../services/factura.service';
import { TarjetaService, Tarjeta } from '../../services/tarjeta.service';
import { OficinaService } from '../../services/oficina.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

interface VehiculoUsuario {
  id_vehiculo: string;
  id_factura: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  imagen_url: string;
}

interface Oficina {
  id_oficina: string;
  nombre: string;
  direccion: string;
}

@Component({
  selector: 'app-crear-orden-servicio',
  standalone: false,
  templateUrl: './crear-orden-servicio.component.html',
  styleUrls: ['./crear-orden-servicio.component.css']
})
export class CrearOrdenServicioComponent implements OnInit {
  id_usuario: string = '';
  serviciosSeleccionados: any[] = [];
  vehiculos: VehiculoUsuario[] = [];
  vehiculoSeleccionado: string = '';
  tarjetas: Tarjeta[] = [];
  tarjetaSeleccionada: string = '';
  oficinas: Oficina[] = [];
  oficinaSeleccionada: string = '';
  descripcionProblema: string = '';
  loading: boolean = false;
  error: string = '';
  paso: number = 1;
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  constructor(
    private ordenService: OrdenServicioService,
    private facturaService: FacturaService,
    private tarjetaService: TarjetaService,
    private oficinaService: OficinaService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.id_usuario = usuario.id_usuario;

    if (!this.id_usuario) {
      this.router.navigate(['/login']);
      return;
    }

    const serviciosGuardados = sessionStorage.getItem('serviciosSeleccionados');
    if (serviciosGuardados) {
      this.serviciosSeleccionados = JSON.parse(serviciosGuardados);
      this.calcularTotales();
    } else {
      this.router.navigate(['/servicios-mantenimiento']);
      return;
    }

    this.cargarVehiculos();
    this.cargarTarjetas();
    this.cargarOficinas();
  }

  calcularTotales(): void {
    this.subtotal = this.serviciosSeleccionados.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    this.iva = this.subtotal * 0.12;
    this.total = this.subtotal + this.iva;
  }

  cargarVehiculos(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`http://localhost:3000/api/facturas/usuario/${this.id_usuario}`, { headers }).subscribe({
      next: (response: any) => {
        const facturas = response.facturas || response || [];

        const vehiculosMap = new Map();
        facturas
          .filter((f: any) => f.estado === 'Pagada' && f.vehiculo)
          .forEach((f: any) => {
            const v = f.vehiculo;
            if (!vehiculosMap.has(v.id_vehiculo)) {
              vehiculosMap.set(v.id_vehiculo, {
                id_vehiculo: v.id_vehiculo,
                id_factura: f.id_factura,
                marca: v.modelo?.marca?.nombre || 'Marca',
                modelo: v.modelo?.nombre || 'Modelo',
                anio: v.anio,
                color: v.color,
                imagen_url: v.imagen_url
              });
            }
          });

        this.vehiculos = Array.from(vehiculosMap.values());

        if (this.vehiculos.length === 0) {
          this.error = 'No tienes vehículos comprados. Debes comprar un vehículo antes de solicitar mantenimiento.';
        }
      },
      error: (err: any) => {
        console.error('Error al cargar vehículos:', err);
        this.error = 'Error al cargar tus vehículos';
      }
    });
  }

  cargarTarjetas(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/api/tarjetas', { headers }).subscribe({
      next: (response: any) => {
        const tarjetasRaw = response.tarjetas || response || [];

        this.tarjetas = tarjetasRaw.map((t: any) => ({
          ...t,
          saldo: parseFloat(t.saldo) || 0
        }));
      },
      error: (err: any) => {
        console.error('Error al cargar tarjetas:', err);
      }
    });
  }

  cargarOficinas(): void {
    this.oficinaService.obtenerOficinas().subscribe({
      next: (data: any) => {
        this.oficinas = data.oficinas || data || [];
      },
      error: (err: any) => {
        console.error('Error al cargar oficinas:', err);
      }
    });
  }

  getVehiculoSeleccionado(): VehiculoUsuario | undefined {
    return this.vehiculos.find(v => v.id_vehiculo === this.vehiculoSeleccionado);
  }

  getTarjetaSeleccionada(): Tarjeta | undefined {
    return this.tarjetas.find(t => t.id_tarjeta === this.tarjetaSeleccionada);
  }

  siguientePaso(): void {
    if (this.paso === 1) {
      if (!this.vehiculoSeleccionado) {
        Swal.fire({
          icon: 'warning',
          title: 'Vehículo requerido',
          text: 'Debes seleccionar un vehículo para continuar',
          confirmButtonColor: '#007bff'
        });
        return;
      }
      this.paso = 2;
    } else if (this.paso === 2) {
      this.paso = 3;
    }
  }

  pasoAnterior(): void {
    if (this.paso > 1) {
      this.paso--;
    }
  }

  async crearOrden(): Promise<void> {
    // Validaciones
    if (!this.vehiculoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Vehículo requerido',
        text: 'Debes seleccionar un vehículo',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    if (!this.tarjetaSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Tarjeta requerida',
        text: 'Debes seleccionar una tarjeta para el pago',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    const tarjeta = this.getTarjetaSeleccionada();
    if (tarjeta && tarjeta.saldo < this.total) {
      Swal.fire({
        icon: 'error',
        title: 'Saldo insuficiente',
        text: `Tu tarjeta no tiene saldo suficiente. Saldo actual: $${tarjeta.saldo.toFixed(2)}`,
        confirmButtonColor: '#007bff'
      });
      return;
    }

    // Confirmación de pago
    const result = await Swal.fire({
      title: '¿Confirmar orden de servicio?',
      html: `
        <div style="text-align: left; margin: 1rem 0;">
          <p><strong>Vehículo:</strong> ${this.getVehiculoSeleccionado()?.marca} ${this.getVehiculoSeleccionado()?.modelo}</p>
          <p><strong>Total a pagar:</strong> <span style="color: #007bff; font-size: 1.5rem;">$${this.total.toFixed(2)}</span></p>
          <p><strong>Método de pago:</strong> Tarjeta **** ${tarjeta?.numero.slice(-4)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545'
    });

    if (!result.isConfirmed) return;

    // Mostrar loading
    Swal.fire({
      title: 'Procesando orden...',
      html: 'Por favor espera mientras procesamos tu pago',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.loading = true;
    this.error = '';

    const ordenData = {
      id_usuario: this.id_usuario,
      id_vehiculo: this.vehiculoSeleccionado,
      tipo_servicio: 'Predeterminado',
      descripcion_problema: this.descripcionProblema || 'Mantenimiento programado',
      servicios: this.serviciosSeleccionados.map(s => ({
        id_servicio: s.id_servicio,
        cantidad: s.cantidad
      })),
      id_oficina: this.oficinaSeleccionada || undefined
    };

    this.ordenService.crearOrden(ordenData).subscribe({
      next: (response: any) => {
        const id_orden = response.orden.id_orden;

        this.ordenService.procesarPago(id_orden, {
          id_tarjeta: this.tarjetaSeleccionada,
          metodo_pago: 'Tarjeta'
        }).subscribe({
          next: () => {
            this.loading = false;
            sessionStorage.removeItem('serviciosSeleccionados');

            Swal.fire({
              icon: 'success',
              title: '¡Orden creada exitosamente!',
              html: `
                <p>Tu orden de servicio ha sido creada y pagada</p>
                <p><strong>Número de orden:</strong> ${response.orden.numero_orden}</p>
              `,
              confirmButtonText: 'Ver mis órdenes',
              confirmButtonColor: '#007bff'
            }).then(() => {
              this.router.navigate(['/mis-ordenes-servicio']);
            });
          },
          error: (err: any) => {
            console.error('Error al procesar pago:', err);
            this.loading = false;

            Swal.fire({
              icon: 'error',
              title: 'Error al procesar pago',
              text: err.error?.error || 'No se pudo completar el pago',
              confirmButtonColor: '#007bff'
            });
          }
        });
      },
      error: (err: any) => {
        console.error('Error al crear orden:', err);
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error al crear orden',
          text: err.error?.error || 'No se pudo crear la orden de servicio',
          confirmButtonColor: '#007bff'
        });
      }
    });
  }

  async cancelar(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se perderá toda la información ingresada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#007bff'
    });

    if (result.isConfirmed) {
      sessionStorage.removeItem('serviciosSeleccionados');
      this.router.navigate(['/servicios-mantenimiento']);
    }
  }

  formatearNumeroTarjeta(numero: string): string {
    return '**** **** **** ' + numero.slice(-4);
  }
}