import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  autosDestacados = [
    {
      nombre: 'Toyota Supra',
      descripcion: 'Deportivo legendario con potencia turbo y diseño icónico.',
      precio: 85000,
      imagen: 'https://acnews.blob.core.windows.net/imgnews/large/NAZ_32d9ae28b98b4cf9bfde6a1bae8f19ff.webp'
    },
    {
      nombre: 'Ford Mustang GT',
      descripcion: 'Motor V8, estilo agresivo y una experiencia única al volante.',
      precio: 92000,
      imagen: 'https://rentlux.es/wp-content/uploads/2023/04/alquilar-ford-mustang.jpg'
    },
    {
      nombre: 'BMW M4 Competition',
      descripcion: 'Elegancia, lujo y potencia de clase mundial.',
      precio: 105000,
      imagen: 'https://blog.consumerguide.com/wp-content/uploads/sites/2/2021/09/aIMG_5370.jpg'
    }
  ];
}
