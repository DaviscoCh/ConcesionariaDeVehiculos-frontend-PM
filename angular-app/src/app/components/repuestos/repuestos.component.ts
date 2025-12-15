import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepuestoService, ItemCarrito } from '../../services/repuesto.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-repuestos',
  standalone: false,
  templateUrl: './repuestos.component.html',
  styleUrl: './repuestos.component.css'
})
export class RepuestosComponent implements OnInit {
  repuestos: any[] = [];
  repuestosFiltrados: any[] = [];
  vehiculos: any[] = [];
  carrito: ItemCarrito[] = [];

  cargando = true;
  mostrarCarrito = false;
  vehiculoSeleccionado: string = '';

  // Filtros
  filtros = {
    busqueda: '',
    categoria: '',
    precioMin: '',
    precioMax: ''
  };

  categorias: string[] = [];

  constructor(
    private repuestoService: RepuestoService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar autenticación
    if (!this.usuarioService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    this.cargarDatos();

    // Suscribirse al carrito
    this.repuestoService.carrito$.subscribe(carrito => {
      this.carrito = carrito;
    });
  }

  cargarDatos() {
    this.cargando = true;

    // Cargar TODOS los repuestos disponibles
    this.repuestoService.obtenerTodos().subscribe({
      next: (response: any) => {
        this.repuestos = response.data;
        this.repuestosFiltrados = response.data;
        this.extraerCategorias();
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar repuestos:', err);
        this.cargando = false;
      }
    });

    // Cargar vehículos del usuario (solo para mostrar)
    this.repuestoService.obtenerVehiculosUsuario().subscribe({
      next: (response: any) => {
        this.vehiculos = response.data;
      },
      error: err => {
        console.error('Error al cargar vehículos:', err);
      }
    });
  }

  cargarRepuestosCompatibles() {
    this.repuestoService.obtenerCompatibles().subscribe({
      next: (response: any) => {
        this.repuestos = response.data;
        this.repuestosFiltrados = response.data;
        this.extraerCategorias();
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar repuestos:', err);
        this.cargando = false;
      }
    });
  }

  filtrarPorMisVehiculos() {
    this.repuestosFiltrados = this.repuestos.filter(repuesto =>
      this.vehiculos.some(vehiculo =>
        repuesto.marcas_compatibles?.includes(vehiculo.marca) ||
        repuesto.modelos_compatibles?.includes(vehiculo.modelo)
      )
    );
  }

  extraerCategorias() {
    this.categorias = [...new Set(this.repuestos.map(r => r.categoria))].sort();
  }

  aplicarFiltros() {
    this.repuestosFiltrados = this.repuestos.filter(repuesto => {
      // Filtro de búsqueda
      const cumpleBusqueda = !this.filtros.busqueda ||
        repuesto.nombre.toLowerCase().includes(this.filtros.busqueda.toLowerCase()) ||
        repuesto.descripcion?.toLowerCase().includes(this.filtros.busqueda.toLowerCase());

      // Filtro de categoría
      const cumpleCategoria = !this.filtros.categoria ||
        repuesto.categoria === this.filtros.categoria;

      // Filtro de precio mínimo
      const cumplePrecioMin = !this.filtros.precioMin ||
        repuesto.precio >= parseFloat(this.filtros.precioMin);

      // Filtro de precio máximo
      const cumplePrecioMax = !this.filtros.precioMax ||
        repuesto.precio <= parseFloat(this.filtros.precioMax);

      // 🆕 Filtro por vehículo seleccionado
      const cumpleVehiculo = !this.vehiculoSeleccionado ||
        this.esCompatibleConVehiculo(repuesto, this.vehiculoSeleccionado);

      return cumpleBusqueda && cumpleCategoria && cumplePrecioMin && cumplePrecioMax && cumpleVehiculo;
    });
  }

  esCompatibleConVehiculo(repuesto: any, vehiculoId: string): boolean {
    const vehiculo = this.vehiculos.find(v => v.id_vehiculo === vehiculoId);
    if (!vehiculo) return false;

    return repuesto.marcas_compatibles?.includes(vehiculo.marca) ||
      repuesto.modelos_compatibles?.includes(vehiculo.modelo);
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      categoria: '',
      precioMin: '',
      precioMax: ''
    };
    this.vehiculoSeleccionado = ''; // 🆕 AGREGAR ESTO
    this.repuestosFiltrados = this.repuestos;
  }

  agregarAlCarrito(repuesto: any) {
    this.repuestoService.agregarAlCarrito(repuesto, 1);
  }

  toggleCarrito() {
    this.mostrarCarrito = !this.mostrarCarrito;
  }

  eliminarDelCarrito(id_repuesto: string) {
    this.repuestoService.eliminarDelCarrito(id_repuesto);
  }

  actualizarCantidad(id_repuesto: string, cantidad: number) {
    if (cantidad < 1) return;
    this.repuestoService.actualizarCantidad(id_repuesto, cantidad);
  }

  obtenerSubtotal(): number {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  obtenerIVA(): number {
    return this.obtenerSubtotal() * 0.15;
  }

  obtenerTotal(): number {
    return this.obtenerSubtotal() + this.obtenerIVA();
  }

  procederAlPago() {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    this.router.navigate(['/checkout-repuestos']);
  }

  esCompatibleConMisVehiculos(repuesto: any): boolean {
    return this.vehiculos.some(vehiculo =>
      repuesto.marcas_compatibles?.includes(vehiculo.marca) ||
      repuesto.modelos_compatibles?.includes(vehiculo.modelo)
    );
  }
}