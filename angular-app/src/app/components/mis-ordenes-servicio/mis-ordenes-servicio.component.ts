import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdenServicioService, OrdenServicio } from '../../services/orden-servicio.service';

@Component({
  selector: 'app-mis-ordenes-servicio',
  standalone: false,
  templateUrl: './mis-ordenes-servicio.component.html',
  styleUrls: ['./mis-ordenes-servicio.component.css']
})
export class MisOrdenesServicioComponent implements OnInit {
  ordenes: OrdenServicio[] = [];
  ordenesFiltradas: OrdenServicio[] = [];
  id_usuario: string = '';
  loading: boolean = true;
  error: string = '';

  // Filtros
  filtroEstado: string = 'Todos';
  estadosDisponibles: string[] = ['Todos', 'Pendiente', 'Aprobado', 'En Proceso', 'Completado', 'Cancelado'];

  constructor(
    private ordenService: OrdenServicioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.id_usuario = usuario.id_usuario;

    if (!this.id_usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.loading = true;
    this.ordenService.getOrdenesByUsuario(this.id_usuario).subscribe({
      next: (data: OrdenServicio[]) => {
        this.ordenes = data;
        this.ordenesFiltradas = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar órdenes:', err);
        this.error = 'Error al cargar tus órdenes de servicio';
        this.loading = false;
      }
    });
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    if (estado === 'Todos') {
      this.ordenesFiltradas = this.ordenes;
    } else {
      this.ordenesFiltradas = this.ordenes.filter(o => o.estado === estado);
    }
  }

  verDetalle(id_orden: string): void {
    this.router.navigate(['/detalle-orden-servicio', id_orden]);
  }

  cancelarOrden(orden: OrdenServicio): void {
    if (orden.estado === 'Completado') {
      alert('No se puede cancelar una orden completada');
      return;
    }

    if (orden.estado === 'Cancelado') {
      alert('Esta orden ya está cancelada');
      return;
    }

    const motivo = prompt('¿Por qué deseas cancelar esta orden?');
    if (!motivo) return;

    this.ordenService.cancelarOrden(orden.id_orden, motivo).subscribe({
      next: () => {
        alert('Orden cancelada exitosamente');
        this.cargarOrdenes();
      },
      error: (err: any) => {
        console.error('Error al cancelar orden:', err);
        alert('Error al cancelar la orden');
      }
    });
  }

  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'Pendiente': 'estado-pendiente',
      'Aprobado': 'estado-aprobado',
      'En Proceso': 'estado-proceso',
      'Completado': 'estado-completado',
      'Cancelado': 'estado-cancelado'
    };
    return clases[estado] || 'estado-default';
  }

  getEstadoIcono(estado: string): string {
    const iconos: { [key: string]: string } = {
      'Pendiente': '⏳',
      'Aprobado': '✅',
      'En Proceso': '🔧',
      'Completado': '🎉',
      'Cancelado': '❌'
    };
    return iconos[estado] || '📋';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);

    // Opciones para zona horaria de Ecuador
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Guayaquil', // Ecuador
      hour12: false
    };

    return date.toLocaleString('es-EC', opciones);
  }

  formatearPrecio(valor: any): string {
    const numero = Number(valor);
    return isNaN(numero) ? '0.00' : numero.toFixed(2);
  }

  irANuevaOrden(): void {
    this.router.navigate(['/servicios-mantenimiento']);
  }
}