import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { VehiculoService } from '../../services/vehiculo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

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

  comprar(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');

      if (!token || token === 'null' || token === '') {
        alert('Debes iniciar sesión para cotizar este vehículo.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 500); // espera 1.5 segundos antes de redirigir
        return;
      }

      const marcaModelo = `${this.vehiculo.marca}-${this.vehiculo.modelo}`;
      this.router.navigate(['/cotizador', marcaModelo]);
      console.log('Usuario autenticado, procediendo a cotizar...');
    }
  }
}

