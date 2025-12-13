import { Component, ChangeDetectorRef } from '@angular/core';
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
  citaReservadaExitosamente = false; // ✅ Nueva variable para mostrar mensaje
  procesandoCita = false; // ✅ Estado del botón
  citaCompletada = false; // ✅ Estado completado

  constructor(
    private citaService: CitaService,
    private vehiculoService: VehiculoService,
    private oficinaService: OficinaService,
    private router: Router,
    private cdr: ChangeDetectorRef
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

    this.oficinaService.obtenerOficinas().subscribe((data: any) => {
      this.oficinas = data;
      this.autocompletarMejorHorario();
    });
  }

  autocompletarMejorHorario() {
    console.log('🔄 Solicitando mejor horario disponible...');

    this.citaService.obtenerMejorHorarioDisponible().subscribe({
      next: (horario) => {
        console.log('🔥 HORARIO RECIBIDO DEL BACKEND:', horario);

        // ✅ Limpiar datos anteriores
        this.cita.fecha = '';
        this.cita.hora = '';
        this.cita.id_oficina = '';
        this.horasDisponibles = [];

        setTimeout(() => {
          // ✅ Normalizar fecha (YYYY-MM-DD)
          const fechaNormalizada = String(horario.fecha).split('T')[0];

          // ✅ Normalizar hora a formato HH:MM:SS para que coincida con el array
          let horaNormalizada = String(horario.hora);
          if (!horaNormalizada.includes(':')) {
            horaNormalizada = `${horaNormalizada}:00:00`;
          } else if (horaNormalizada.split(':').length === 2) {
            // Si viene HH:MM, agregar :00
            horaNormalizada = `${horaNormalizada}:00`;
          }

          console.log('📋 DATOS NORMALIZADOS:', {
            fechaNormalizada,
            horaNormalizada,
            oficinaId: horario.id_oficina
          });

          // ✅ Asignar valores
          this.cita.fecha = fechaNormalizada;
          this.cita.hora = horaNormalizada;
          this.cita.id_oficina = horario.id_oficina;

          console.log('✅ CITA ASIGNADA:', {
            fecha: this.cita.fecha,
            hora: this.cita.hora,
            oficina: this.cita.id_oficina
          });

          if (this.vehiculo && !this.cita.comentario) {
            this.cita.comentario = `Cotización de ${this.vehiculo.marca} ${this.vehiculo.modelo} ${this.vehiculo.anio}`;
          }

          this.cdr.detectChanges();
          this.actualizarHorasDisponibles();
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error al obtener horario disponible:', err);
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

    if (!id_oficina || !fecha || !hora) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor selecciona oficina, fecha y hora antes de reservar.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // ✅ Validar que no sea un horario pasado
    const ahora = new Date();
    const [year, month, day] = fecha.split('-').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);
    const fechaSeleccionada = new Date(year, month - 1, day, hours, minutes);

    console.log('🕐 Validando horario:', {
      ahora: ahora.toISOString(),
      seleccionado: fechaSeleccionada.toISOString(),
      yaPaso: fechaSeleccionada < ahora
    });

    if (fechaSeleccionada < ahora) {
      Swal.fire({
        icon: 'warning',
        title: 'Horario inválido',
        text: 'No puedes reservar una cita en un horario que ya pasó.',
        confirmButtonText: 'Entendido'
      }).then(() => {
        this.autocompletarMejorHorario();
      });
      return;
    }

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
        this.procesandoCita = true; // ✅ Activar estado procesando
        this.citaCompletada = false;
        this.crearCitaFinal();
      }
    });
  }

  crearCitaFinal() {
    // ✅ Normalizar antes de enviar
    if (this.cita.hora.includes(':')) {
      this.cita.hora = this.cita.hora.substring(0, 5);
    }

    if (this.cita.fecha.includes('T')) {
      this.cita.fecha = this.cita.fecha.split('T')[0];
    }

    console.log('📤 Enviando cita al backend:', this.cita);

    this.citaService.crearCita(this.cita).subscribe({
      next: () => {
        // ✅ Cambiar a estado completado
        this.procesandoCita = false;
        this.citaCompletada = true;
        this.citaReservadaExitosamente = true;

        Swal.fire({
          icon: 'success',
          title: 'Cita reservada',
          text: 'Tu cita ha sido registrada correctamente.',
          confirmButtonText: 'Perfecto'
        });

        localStorage.removeItem('vehiculo_para_cita');

        // ✅ LIMPIAR completamente el formulario después de 2 segundos
        setTimeout(() => {
          this.cita = {
            id_usuario: this.cita.id_usuario,
            id_vehiculo: this.cita.id_vehiculo,
            id_oficina: '',
            fecha: '',
            hora: '',
            comentario: ''
          };

          this.horasDisponibles = [];
          this.citaCompletada = false; // Reset estado del botón
          this.cdr.detectChanges();
        }, 2000);

        // ✅ Ocultar mensaje después de 5 segundos
        setTimeout(() => {
          this.citaReservadaExitosamente = false;
        }, 5000);

        // ✅ NO llamar a autocompletarMejorHorario() para dejar el formulario limpio
      },
      error: (err) => {
        // ✅ Resetear estados en caso de error
        this.procesandoCita = false;
        this.citaCompletada = false;

        console.error('❌ Error al reservar cita:', err);

        const mensajeError = err.error?.error === 'El horario seleccionado ya está reservado'
          ? 'El horario que seleccionaste acaba de ser reservado por otro usuario. Por favor elige otro.'
          : 'Hubo un problema al registrar la cita. Intenta nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Error al reservar',
          text: mensajeError,
          confirmButtonText: 'Cerrar'
        }).then(() => {
          // ✅ Solo en caso de error, sugerir otro horario
          this.autocompletarMejorHorario();
        });
      }
    });
  }

  getNombreOficina(id: string): string {
    const oficina = this.oficinas.find(o => o.id_oficina === id);
    return oficina ? oficina.nombre : '';
  }

  actualizarHorasDisponibles() {
    if (!this.cita.fecha || !this.cita.id_oficina) {
      console.log('⚠️ No hay fecha u oficina seleccionada');
      return;
    }

    console.log('🔄 Obteniendo horarios disponibles para:', {
      fecha: this.cita.fecha,
      oficina: this.cita.id_oficina
    });

    this.citaService.obtenerHorariosDisponibles(this.cita.fecha, this.cita.id_oficina)
      .subscribe({
        next: (res) => {
          console.log('📋 Horarios disponibles ORIGINALES:', res.horarios);

          // ✅ FILTRAR horarios que ya pasaron
          const ahora = new Date();
          const [year, month, day] = this.cita.fecha.split('-').map(Number);

          this.horasDisponibles = (res.horarios ?? []).filter(hora => {
            const [hours, minutes] = hora.split(':').map(Number);
            const fechaHora = new Date(year, month - 1, day, hours, minutes);
            const noHaPasado = fechaHora >= ahora;

            if (!noHaPasado) {
              console.log(`⏰ Filtrando hora ${hora} - ya pasó`);
            }

            return noHaPasado;
          });

          console.log('✅ Horarios disponibles FILTRADOS:', this.horasDisponibles);

          // ✅ Verificar si la hora actual está disponible
          if (this.cita.hora && !this.horasDisponibles.includes(this.cita.hora)) {
            console.log('⚠️ La hora seleccionada ya no está disponible:', this.cita.hora);
            this.cita.hora = '';
          }

          // ✅ Si no hay hora seleccionada y hay horarios disponibles
          if (!this.cita.hora && this.horasDisponibles.length > 0) {
            this.cita.hora = this.horasDisponibles[0];
            console.log('✅ Auto-seleccionada primera hora disponible:', this.cita.hora);
          }

          // ✅ Si NO hay horarios disponibles
          if (this.horasDisponibles.length === 0) {
            console.log('❌ No hay horarios futuros disponibles para esta fecha');
            this.cita.hora = '';
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("❌ Error obteniendo horarios disponibles:", err);
          this.horasDisponibles = [];
        }
      });
  }
}