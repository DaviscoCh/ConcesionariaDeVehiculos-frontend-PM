import { Component } from '@angular/core';
import { CitaService } from '../../services/cita.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OficinaService } from '../../services/oficina.service';
import { OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-cita.component.html',
  styleUrl: './reservar-cita.component.css'
})
export class ReservarCitaComponent implements OnInit {
  cita = {
    id_usuario: '',
    id_vehiculo: '',
    id_oficina: '',
    fecha: '',
    hora: '',
    comentario: ''
  };

  vehiculo: any;
  oficinas: any[] = [];
  mensajeExito = '';
  minFecha = new Date().toISOString().split('T')[0];
  horasDisponibles: string[] = [];

  constructor(
    private citaService: CitaService,
    private vehiculoService: VehiculoService,
    private oficinaService: OficinaService,
    private router: Router
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { vehiculo: any };

    if (state?.vehiculo) {
      this.vehiculo = state.vehiculo;
      this.cita.id_vehiculo = state.vehiculo.id_vehiculo;
      localStorage.setItem('vehiculo_para_cita', JSON.stringify(state.vehiculo));
    } else {
      const vehiculoGuardado = localStorage.getItem('vehiculo_para_cita');
      if (vehiculoGuardado) {
        this.vehiculo = JSON.parse(vehiculoGuardado);
        this.cita.id_vehiculo = this.vehiculo.id_vehiculo;
      } else {
        alert('No se ha seleccionado un vehículo para reservar.');
        this.router.navigate(['/vehiculos']);
        return;
      }
    }

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cita.id_usuario = usuario.id_usuario;

    // Cargar oficinas
    this.oficinaService.obtenerOficinas().subscribe((data: any) => {
      this.oficinas = data;
      // Autocompletar con el mejor horario disponible
      this.autocompletarMejorHorario();
    });
  }

  // ✅ NUEVA FUNCIÓN: Autocompletar usando el endpoint del backend
  autocompletarMejorHorario() {
    this.citaService.obtenerMejorHorarioDisponible().subscribe({
      next: (horario) => {
        // Convertir fecha ISO a formato YYYY-MM-DD para el input date
        this.cita.fecha = horario.fecha.includes('T')
          ? horario.fecha.split('T')[0]
          : horario.fecha;

        // Normalizar hora (solo HH:MM)
        this.cita.hora = horario.hora.substring(0, 5);

        this.cita.id_oficina = horario.id_oficina;

        // Autocompletar comentario descriptivo
        if (this.vehiculo && !this.cita.comentario) {
          this.cita.comentario = `Cotización de ${this.vehiculo.marca} ${this.vehiculo.modelo} ${this.vehiculo.anio}`;
        }

        // Cargar horarios disponibles de esa fecha/oficina
        this.actualizarHorasDisponibles();
      },
      error: (err) => {
        console.error('Error al obtener horario disponible:', err);
        Swal.fire({
          icon: 'info',
          title: 'Sin disponibilidad',
          text: 'No hay horarios disponibles en los próximos días.',
        });
      }
    });
  }

  reservarCita() {
    const { id_oficina, fecha, hora } = this.cita;

    // Validación de campos vacíos
    if (!id_oficina || !fecha || !hora) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor selecciona oficina, fecha y hora antes de reservar.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Validación de fecha pasada
    const ahora = new Date();
    const fechaSeleccionada = new Date(`${fecha}T${hora}`);

    if (fechaSeleccionada < ahora) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'No puedes reservar una cita en una fecha u hora que ya pasó.',
        confirmButtonText: 'Entendido'
      }).then(() => {
        this.cita.fecha = '';
        this.cita.hora = '';
      });
      return;
    }

    // Mostrar confirmación
    Swal.fire({
      icon: 'question',
      title: '¿Confirmar cita?',
      html: `
        <p>Vehículo: <strong>${this.vehiculo.marca} ${this.vehiculo.modelo} (${this.vehiculo.anio})</strong></p>
        <p>Fecha: <strong>${this.cita.fecha}</strong></p>
        <p>Hora: <strong>${this.cita.hora}</strong></p>
        <p>Oficina: <strong>${this.getNombreOficina(this.cita.id_oficina)}</strong></p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.crearCitaFinal();
      }
    });
  }

  crearCitaFinal() {
    // Normalizar hora (solo HH:MM)
    if (this.cita.hora.includes(':')) {
      this.cita.hora = this.cita.hora.substring(0, 5);
    }

    // Normalizar fecha (solo YYYY-MM-DD)
    if (this.cita.fecha.includes('T')) {
      this.cita.fecha = this.cita.fecha.split('T')[0];
    }

    this.citaService.crearCita(this.cita).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Cita reservada',
          text: 'Tu cita ha sido registrada correctamente.',
          confirmButtonText: 'Perfecto'
        });
        localStorage.removeItem('vehiculo_para_cita');

        // Limpiar el formulario
        this.cita = {
          id_usuario: this.cita.id_usuario,
          id_vehiculo: this.cita.id_vehiculo,
          id_oficina: '',
          fecha: '',
          hora: '',
          comentario: ''
        };

        // Autocompletar siguiente horario disponible
        this.autocompletarMejorHorario();
      },
      error: (err) => {
        console.error('Error al reservar cita:', err);

        // Mensaje específico si el horario ya fue tomado
        const mensajeError = err.error?.error === 'El horario seleccionado ya está reservado'
          ? 'El horario que seleccionaste acaba de ser reservado por otro usuario. Por favor elige otro.'
          : 'Hubo un problema al registrar la cita. Intenta nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Error al reservar',
          text: mensajeError,
          confirmButtonText: 'Cerrar'
        }).then(() => {
          // Recargar horarios disponibles
          this.autocompletarMejorHorario();
        });
      }
    });
  }

  getNombreOficina(id: string): string {
    const oficina = this.oficinas.find(o => o.id_oficina === id);
    return oficina ? oficina.nombre : '';
  }

  // Actualizar horarios disponibles cuando cambia fecha u oficina
  actualizarHorasDisponibles() {
    if (!this.cita.fecha || !this.cita.id_oficina) return;

    this.citaService.obtenerHorariosDisponibles(this.cita.fecha, this.cita.id_oficina)
      .subscribe({
        next: (res) => {
          this.horasDisponibles = res.horarios ?? [];

          // Si la hora actual ya no está disponible, limpiar
          if (this.cita.hora && !this.horasDisponibles.includes(this.cita.hora)) {
            this.cita.hora = '';
          }

          // Autoseleccionar la primera disponible si no hay hora seleccionada
          if (!this.cita.hora && this.horasDisponibles.length > 0) {
            this.cita.hora = this.horasDisponibles[0];
          }
        },
        error: (err) => {
          console.error("Error obteniendo horarios disponibles:", err);
          this.horasDisponibles = [];
        }
      });
  }
}