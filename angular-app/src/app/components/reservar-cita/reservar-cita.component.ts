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
    id_usuario: '', // lo obtendrás del login
    id_vehiculo: '',
    id_oficina: '',
    fecha: '',
    hora: '',
    comentario: ''
  };
  vehiculo: any;
  oficinas: any[] = [];
  mensajeExito = '';
  minFecha = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD

  constructor(private citaService: CitaService,
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
      localStorage.setItem('vehiculo_para_cita', JSON.stringify(state.vehiculo)); // respaldo
      console.log('Usuario cargado:', this.cita.id_usuario);
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

    this.oficinaService.obtenerOficinas().subscribe((data: any) => {
      this.oficinas = data;
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

    this.citaService.verificarDisponibilidad(fecha, hora, id_oficina).subscribe({
      next: (res) => {
        if (!res.disponible) {
          Swal.fire({
            icon: 'warning',
            title: 'Horario ocupado',
            text: 'La oficina ya tiene una cita en esa fecha y hora. Por favor elige otro horario.',
            confirmButtonText: 'Entendido'
          }).then(() => {
            this.cita.hora = '';
          });
          return;
        }

        // ✅ Si está disponible, crear la cita
        this.citaService.crearCita(this.cita).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Cita reservada',
              text: 'Tu cita ha sido registrada correctamente.',
              confirmButtonText: 'Perfecto'
            });
            localStorage.removeItem('vehiculo_para_cita');
            this.cita = {
              id_usuario: this.cita.id_usuario,
              id_vehiculo: this.cita.id_vehiculo,
              id_oficina: '',
              fecha: '',
              hora: '',
              comentario: ''
            };
          },
          error: (err) => {
            console.error('Error al reservar cita:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error al reservar',
              text: 'Hubo un problema al registrar la cita. Intenta nuevamente.',
              confirmButtonText: 'Cerrar'
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al verificar disponibilidad:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de verificación',
          text: 'No se pudo verificar la disponibilidad. Intenta más tarde.',
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }

  horasDisponibles: string[] = [];
  todasLasHoras: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  actualizarHorasDisponibles() {
    if (this.cita.fecha && this.cita.id_oficina) {
      this.citaService.obtenerHorasOcupadas(this.cita.fecha, this.cita.id_oficina).subscribe({
        next: (res) => {
          const ocupadas = res.horas;
          this.horasDisponibles = this.todasLasHoras.filter(h => !ocupadas.includes(h));
        },
        error: (err) => console.error('Error al obtener horas ocupadas:', err)
      });
    }
  }
}
