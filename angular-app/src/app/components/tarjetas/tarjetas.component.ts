import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

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

  // ✅ VALIDACIONES
  errores = {
    numero: '',
    nombre: '',
    vencimiento: '',
    cvv: ''
  };

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

  // ========================================
  // ✅ VALIDAR NÚMERO DE TARJETA
  // ========================================
  validarNumero(): void {
    const numero = this.nuevaTarjeta.numero.replace(/\s/g, ''); // Quitar espacios

    if (numero.length === 0) {
      this.errores.numero = '';
      return;
    }

    if (!/^\d+$/.test(numero)) {
      this.errores.numero = '❌ Solo se permiten números';
      return;
    }

    if (numero.length < 13) {
      this.errores.numero = `⚠️ Faltan ${13 - numero.length} dígitos (mínimo 13)`;
      return;
    }

    if (numero.length > 19) {
      this.errores.numero = '❌ Máximo 19 dígitos';
      return;
    }

    this.errores.numero = '✅ Número válido';
  }

  // ========================================
  // ✅ VALIDAR CVV
  // ========================================
  validarCVV(): void {
    const cvv = this.nuevaTarjeta.cvv;

    if (cvv.length === 0) {
      this.errores.cvv = '';
      return;
    }

    if (!/^\d+$/.test(cvv)) {
      this.errores.cvv = '❌ Solo números';
      return;
    }

    if (cvv.length < 3) {
      this.errores.cvv = `⚠️ Mínimo 3 dígitos`;
      return;
    }

    if (cvv.length > 4) {
      this.errores.cvv = '❌ Máximo 4 dígitos';
      return;
    }

    this.errores.cvv = '✅ CVV válido';
  }

  // ========================================
  // ✅ VALIDAR VENCIMIENTO (MM/AA)
  // ========================================
  validarVencimiento(): void {
    const vencimiento = this.nuevaTarjeta.vencimiento;

    if (vencimiento.length === 0) {
      this.errores.vencimiento = '';
      return;
    }

    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if (!regex.test(vencimiento)) {
      this.errores.vencimiento = '❌ Formato:  MM/AA (Ejemplo: 12/25)';
      return;
    }

    // Validar que no esté vencida
    const [mes, anio] = vencimiento.split('/').map(Number);
    const hoy = new Date();
    const anioActual = hoy.getFullYear() % 100; // Últimos 2 dígitos
    const mesActual = hoy.getMonth() + 1;

    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      this.errores.vencimiento = '❌ La tarjeta está vencida';
      return;
    }

    this.errores.vencimiento = '✅ Fecha válida';
  }

  // ========================================
  // ✅ VALIDAR NOMBRE
  // ========================================
  validarNombre(): void {
    const nombre = this.nuevaTarjeta.nombre.trim();

    if (nombre.length === 0) {
      this.errores.nombre = '';
      return;
    }

    if (nombre.length < 3) {
      this.errores.nombre = '⚠️ Mínimo 3 caracteres';
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
      this.errores.nombre = '❌ Solo letras y espacios';
      return;
    }

    this.errores.nombre = '✅ Nombre válido';
  }

  // ========================================
  // ✅ VERIFICAR SI EL FORMULARIO ES VÁLIDO
  // ========================================
  formularioValido(): boolean {
    return (
      this.errores.numero.includes('✅') &&
      this.errores.cvv.includes('✅') &&
      this.errores.vencimiento.includes('✅') &&
      this.errores.nombre.includes('✅')
    );
  }

  // ========================================
  // ✅ AGREGAR TARJETA CON VALIDACIÓN
  // ========================================
  agregarTarjeta(): void {
    // Validar todo antes de enviar
    this.validarNumero();
    this.validarCVV();
    this.validarVencimiento();
    this.validarNombre();

    if (!this.formularioValido()) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor corrige los errores antes de continuar'
      });
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post<any>('http://localhost:3000/api/tarjetas', this.nuevaTarjeta, { headers }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Tarjeta registrada! ',
          text: res.mensaje,
          confirmButtonColor: '#3085d6'
        });

        // Resetear formulario y errores
        this.nuevaTarjeta = { numero: '', nombre: '', vencimiento: '', cvv: '', tipo: 'prepago' };
        this.errores = { numero: '', nombre: '', vencimiento: '', cvv: '' };
        this.cargarTarjetas();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.error || 'Error al agregar tarjeta'
        });
      }
    });
  }

  // ========================================
  // ✅ ELIMINAR TARJETA
  // ========================================
  eliminarTarjeta(id_tarjeta: string): void {
    Swal.fire({
      title: '¿Eliminar tarjeta?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete<any>(`http://localhost:3000/api/tarjetas/${id_tarjeta}`, { headers }).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminada',
              text: res.mensaje,
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarTarjetas();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la tarjeta'
            });
          }
        });
      }
    });
  }

  recargarSaldo(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put<any>('http://localhost:3000/api/tarjetas/recargar', this.recarga, { headers }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Saldo recargado',
          text: res.mensaje,
          confirmButtonColor: '#3085d6'
        });
        this.recarga = { id_tarjeta: '', monto: 0 };
        this.cargarTarjetas();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al recargar saldo'
        });
      }
    });
  }
}