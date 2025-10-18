import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cotizador',
  standalone: false,
  templateUrl: './cotizador.component.html',
  styleUrl: './cotizador.component.css'
})
export class CotizadorComponent {
  marca: string = '';
  modelo: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const marcaModelo = this.route.snapshot.paramMap.get('marca-modelo');

    if (marcaModelo) {
      const partes = marcaModelo.split('-');
      this.marca = partes[0];
      this.modelo = partes.slice(1).join('-'); // por si el modelo tiene guiones
    }
  }
}
