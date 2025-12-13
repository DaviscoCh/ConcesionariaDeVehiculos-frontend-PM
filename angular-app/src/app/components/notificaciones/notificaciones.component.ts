import { Component, OnInit } from '@angular/core';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  standalone: false,
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  notificacionesFiltradas: Notificacion[] = [];
  cargando: boolean = true;
  error: string = '';
  filtroActivo: string = 'todas';
  mensajeExito: string = '';

  constructor(private notificacionService: NotificacionService) { }

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.cargando = true;
    this.notificacionService.getNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.aplicarFiltro(this.filtroActivo);
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las notificaciones';
        console.error(err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(filtro: string): void {
    this.filtroActivo = filtro;

    if (filtro === 'todas') {
      this.notificacionesFiltradas = this.notificaciones;
    } else if (filtro === 'noLeidas') {
      this.notificacionesFiltradas = this.notificaciones.filter(n => !n.leida);
    } else if (filtro === 'leidas') {
      this.notificacionesFiltradas = this.notificaciones.filter(n => n.leida);
    } else {
      // Filtrar por tipo
      this.notificacionesFiltradas = this.notificaciones.filter(n => n.tipo === filtro);
    }
  }

  marcarComoLeida(notificacion: Notificacion): void {
    if (notificacion.leida) return;

    this.notificacionService.marcarComoLeida(notificacion.id_notificacion).subscribe({
      next: () => {
        notificacion.leida = true;
        this.notificacionService.actualizarContador();
      },
      error: (err) => {
        console.error('Error al marcar como leída:', err);
      }
    });
  }

  marcarTodasLeidas(): void {
    if (this.notificaciones.filter(n => !n.leida).length === 0) {
      return;
    }

    this.notificacionService.marcarTodasLeidas().subscribe({
      next: () => {
        this.notificaciones.forEach(n => n.leida = true);
        this.notificacionService.actualizarContador();
        this.aplicarFiltro(this.filtroActivo);
      },
      error: (err) => {
        console.error('Error al marcar todas como leídas:', err);
      }
    });
  }

  eliminarNotificacion(id: string): void {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

    this.notificacionService.eliminarNotificacion(id).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.id_notificacion !== id);
        this.aplicarFiltro(this.filtroActivo);
        this.notificacionService.actualizarContador();
      },
      error: (err) => {
        console.error('Error al eliminar notificación:', err);
      }
    });
  }

  obtenerClaseTipo(tipo: string): string {
    const clases: { [key: string]: string } = {
      'cita_confirmada': 'tipo-confirmada',
      'cita_cancelada': 'tipo-cancelada',
      'cita_atendida': 'tipo-atendida',
    };
    return clases[tipo] || 'tipo-default';
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'cita_confirmada': '✅',
      'cita_cancelada': '❌',
      'cita_atendida': '✔️',
    };
    return iconos[tipo] || '📢';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    if (dias < 7) return `Hace ${dias} d`;

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  mostrarMensaje(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
  }

  get totalNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }
}