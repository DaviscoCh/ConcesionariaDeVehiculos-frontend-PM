import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ofertas',
  standalone: false,
  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.css'
})
export class OfertasComponent {

  // Promociones (próximamente)
  promociones = [
    {
      titulo: 'Black Friday',
      descripcion: 'Hasta 25% de descuento en vehículos seleccionados',
      icono: 'bi-tag-fill',
      color: '#dc3545',
      badge: 'Próximamente',
      imagen: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800'
    },
    {
      titulo: 'Financiamiento 0%',
      descripcion: 'Crédito sin intereses a 12 meses en modelos nuevos',
      icono: 'bi-percent',
      color: '#28a745',
      badge: 'Próximamente',
      imagen: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'
    },
    {
      titulo: 'Vehículos de Exhibición',
      descripcion: 'Precios especiales en vehículos de showroom',
      icono: 'bi-car-front-fill',
      color: '#ffc107',
      badge: 'Próximamente',
      imagen: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
    },
  ];

  constructor(private router: Router) { }

  verVehiculos() {
    this.router.navigate(['/vehiculos']);
  }

  agendarCita() {
    this.router.navigate(['/reservar-cita']);
  }
}