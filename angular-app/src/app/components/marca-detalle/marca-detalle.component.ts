import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarcaService } from '../../services/marca.service';

@Component({
  selector: 'app-marca-detalle',
  standalone: false,
  templateUrl: './marca-detalle.component.html',
  styleUrl: './marca-detalle.component.css'
})
export class MarcaDetalleComponent implements OnInit {
  marca: any = null;
  vehiculos: any[] = [];
  cargando = true;
  error = '';

  // Logos de marcas (mismo objeto del componente anterior)
  logosMarcas: { [key: string]: string } = {
    'Toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
    'Honda': 'https://www.carlogos.org/car-logos/honda-logo.png',
    'Ford': 'https://www.carlogos.org/car-logos/ford-logo.png',
    'Chevrolet': 'https://www.carlogos.org/car-logos/chevrolet-logo.png',
    'Nissan': 'https://www.carlogos.org/car-logos/nissan-logo.png',
    'Mazda': 'https://www.carlogos.org/car-logos/mazda-logo.png',
    'Volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
    'BMW': 'https://www.carlogos.org/car-logos/bmw-logo.png',
    'Mercedes-Benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
    'Audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
    'Hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo.png',
    'Kia': 'https://www.carlogos.org/car-logos/kia-logo.png'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marcaService: MarcaService
  ) { }

  ngOnInit() {
    const id_marca = this.route.snapshot.paramMap.get('id');
    console.log('ID capturado desde la ruta:', id_marca); // 👈 Agrega esto
    if (id_marca) {
      this.cargarMarca(id_marca);
      this.cargarVehiculos(id_marca);
    } else {
      this.router.navigate(['/marcas']);
    }
  }

  cargarMarca(id_marca: string) {
    this.marcaService.obtenerPorId(id_marca).subscribe({
      next: (response: any) => {
        this.marca = response;
      },
      error: err => {
        console.error('Error al cargar marca:', err);
        this.error = 'Error al cargar la marca';
      }
    });
  }

  onImgError(event: Event, nombre: string) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300x150?text=' + nombre;
  }

  cargarVehiculos(id_marca: string) {
    this.cargando = true;
    this.marcaService.obtenerVehiculosPorMarca(id_marca).subscribe({
      next: (response: any) => {
        this.vehiculos = response;
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar vehículos:', err);
        this.error = 'Error al cargar los vehículos';
        this.cargando = false;
      }
    });
  }

  verDetalleVehiculo(id_vehiculo: string) {
    this.router.navigate(['/vehiculos-detalle', id_vehiculo]);
  }

  volverAMarcas() {
    this.router.navigate(['/marcas']);
  }

  obtenerLogo(nombreMarca: string): string {
    return this.logosMarcas[nombreMarca] || 'https://via.placeholder.com/300x150?text=' + nombreMarca;
  }
}