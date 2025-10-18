import { Component } from '@angular/core';
import { VehiculoService } from '../../services/vehiculo.service';

@Component({
  selector: 'app-vehiculos',
  standalone: false,
  templateUrl: './vehiculos.component.html',
  styleUrl: './vehiculos.component.css'
})
export class VehiculosComponent {
  vehiculos: any[] = [];
  cargando = true;

  constructor(
    private vehiculoService: VehiculoService) { }

  ngOnInit() {
    this.vehiculoService.getVehiculos().subscribe({
      next: data => {
        this.vehiculos = data;
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        this.vehiculos = [];
      }
    });
  }
}
