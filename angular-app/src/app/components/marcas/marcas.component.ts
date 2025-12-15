import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarcaService } from '../../services/marca.service';

@Component({
  selector: 'app-marcas',
  standalone: false,
  templateUrl: './marcas.component.html',
  styleUrl: './marcas.component.css'
})
export class MarcasComponent implements OnInit {
  marcas: any[] = [];
  cargando = true;
  error = '';

  // Logos de marcas (URLs de ejemplo - puedes cambiarlas)
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
    private marcaService: MarcaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarMarcas();
  }

  cargarMarcas() {
    this.cargando = true;
    this.marcaService.obtenerTodas().subscribe({
      next: (response: any) => {
        console.log('Marcas recibidas:', response); // 👈 Verifica la estructura
        this.marcas = response;
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar marcas:', err);
        this.error = 'Error al cargar las marcas';
        this.cargando = false;
      }
    });
  }

  verDetalleMarca(marca: any) {
    this.router.navigate(['/marca-detalle', marca.id_marca]);
  }

  obtenerLogo(nombreMarca: string): string {
    return this.logosMarcas[nombreMarca] || 'https://via.placeholder.com/200x100?text=' + nombreMarca;
  }

  onImgError(event: Event, nombre: string) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/200x100?text=' + nombre;
  }

}