import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private toastService: ToastService) { }

  autosDestacados = [
    {
      id: 1,
      nombre: 'Toyota Corolla 2024',
      descripcion: 'Sedán elegante con tecnología avanzada y máximo confort',
      precio: 28500,
      imagen: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      nombre: 'Honda CR-V Hybrid',
      descripcion: 'SUV híbrido con diseño moderno y eficiencia energética',
      precio: 42000,
      imagen: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      nombre: 'Mazda CX-5 Turbo',
      descripcion: 'Deportividad y elegancia en un SUV de alto rendimiento',
      precio: 38900,
      imagen: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
    }
  ];

  probarToast() {
    console.log('Llamando al toast...');
    this.toastService.mostrar({
      tipo: 'info',
      titulo: 'Prueba',
      mensaje: 'Este es un toast de prueba',
      duracion: 5000
    });
  }

}
