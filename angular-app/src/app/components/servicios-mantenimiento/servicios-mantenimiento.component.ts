import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioMantenimientoService, ServicioMantenimiento } from '../../services/servicio-mantenimiento.service';

@Component({
  selector: 'app-servicios-mantenimiento',
  standalone: false,
  templateUrl: './servicios-mantenimiento.component.html',
  styleUrls: ['./servicios-mantenimiento.component.css']
})
export class ServiciosMantenimientoComponent implements OnInit {
  servicios: ServicioMantenimiento[] = [];
  serviciosFiltrados: ServicioMantenimiento[] = [];
  categorias: string[] = [];
  categoriaSeleccionada: string = 'Todos';
  loading: boolean = true;
  error: string = '';

  // Servicios seleccionados para crear orden
  serviciosSeleccionados: Map<string, { servicio: ServicioMantenimiento; cantidad: number }> = new Map();

  constructor(
    private servicioService: ServicioMantenimientoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarServicios();
  }

  cargarCategorias(): void {
    this.servicioService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = ['Todos', ...data];
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  cargarServicios(): void {
    this.loading = true;
    this.servicioService.getAll().subscribe({
      next: (data) => {
        // Convertir precio_mano_obra a número
        this.servicios = data.map(s => ({
          ...s,
          precio_mano_obra: parseFloat(s.precio_mano_obra as any) || 0,
          tiempo_estimado: parseInt(s.tiempo_estimado as any) || 0
        }));
        this.serviciosFiltrados = this.servicios;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.error = 'Error al cargar los servicios de mantenimiento';
        this.loading = false;
      }
    });
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'Todos') {
      this.serviciosFiltrados = this.servicios;
    } else {
      this.serviciosFiltrados = this.servicios.filter(s => s.categoria === categoria);
    }
  }

  toggleSeleccion(servicio: ServicioMantenimiento): void {
    const id = servicio.id_servicio;
    if (this.serviciosSeleccionados.has(id)) {
      this.serviciosSeleccionados.delete(id);
    } else {
      this.serviciosSeleccionados.set(id, { servicio, cantidad: 1 });
    }
  }

  isSeleccionado(id: string): boolean {
    return this.serviciosSeleccionados.has(id);
  }

  actualizarCantidad(id: string, cantidad: number): void {
    const item = this.serviciosSeleccionados.get(id);
    if (item && cantidad > 0) {
      item.cantidad = cantidad;
    }
  }

  getCantidad(id: string): number {
    return this.serviciosSeleccionados.get(id)?.cantidad || 1;
  }

  calcularTotal(): number {
    let total = 0;
    this.serviciosSeleccionados.forEach(item => {
      total += item.servicio.precio_mano_obra * item.cantidad;
    });
    return total;
  }

  calcularIVA(): number {
    return this.calcularTotal() * 0.12;
  }

  calcularGrandTotal(): number {
    return this.calcularTotal() + this.calcularIVA();
  }

  continuar(): void {
    if (this.serviciosSeleccionados.size === 0) {
      alert('Debes seleccionar al menos un servicio');
      return;
    }

    // Guardar servicios seleccionados en sessionStorage
    const serviciosArray = Array.from(this.serviciosSeleccionados.values()).map(item => ({
      id_servicio: item.servicio.id_servicio,
      cantidad: item.cantidad,
      nombre: item.servicio.nombre,
      precio: item.servicio.precio_mano_obra
    }));

    sessionStorage.setItem('serviciosSeleccionados', JSON.stringify(serviciosArray));

    // Navegar a crear orden
    this.router.navigate(['/crear-orden-servicio']);
  }

  limpiarSeleccion(): void {
    this.serviciosSeleccionados.clear();
  }
}