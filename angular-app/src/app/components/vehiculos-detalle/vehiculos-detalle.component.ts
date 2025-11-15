import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { VehiculoService } from '../../services/vehiculo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos-detalle',
  standalone: false,
  templateUrl: './vehiculos-detalle.component.html',
  styleUrl: './vehiculos-detalle.component.css'
})
export class VehiculosDetalleComponent implements OnInit {
  vehiculo: any;
  usuarioAutenticado = false;

  constructor(
    private route: ActivatedRoute,
    private vehiculoService: VehiculoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.vehiculoService.obtenerVehiculoPorId(id).subscribe({
        next: data => this.vehiculo = data,
        error: err => console.error('Error al cargar vehículo:', err)
      });

      if (isPlatformBrowser(this.platformId)) {
        this.usuarioAutenticado = !!localStorage.getItem('token');
      }
    } else {
      console.error('ID de vehículo no proporcionado en la ruta');
    }
  }

  reservarCita(): void {
    console.log('Ejecutando reservarCita()...');
    console.log('isPlatformBrowser:', isPlatformBrowser(this.platformId));

    if (!isPlatformBrowser(this.platformId)) {
      console.warn('⚠️ No se ejecuta en el navegador');
      return;
    }

    const token = (localStorage.getItem('token') || '').trim();
    const tokenValido = token && token !== 'null' && token !== 'undefined';

    if (!tokenValido) {
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión para reservar',
        text: 'Debes iniciar sesión con tu cuenta para poder reservar una cita para este vehículo.',
        confirmButtonText: 'Ir al login'
      }).then(resultado => {
        if (resultado.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    localStorage.setItem('vehiculo_para_cita', JSON.stringify(this.vehiculo));
    console.log('Usuario autenticado, redirigiendo a reservar cita...');
    this.router.navigate(['/reservar-cita']);
  }

}

