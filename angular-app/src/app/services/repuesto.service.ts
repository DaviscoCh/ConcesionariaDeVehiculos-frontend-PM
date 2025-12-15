import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ItemCarrito {
  id_repuesto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen_url: string;
  categoria: string;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class RepuestoService {
  private apiUrl = 'http://localhost:3000/api/repuestos';
  private comprasUrl = 'http://localhost:3000/api/compras-repuestos';

  // Carrito de compras en memoria
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public carrito$ = this.carritoSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar carrito desde localStorage si existe
    const carritoGuardado = localStorage.getItem('carrito_repuestos');
    if (carritoGuardado) {
      this.carritoSubject.next(JSON.parse(carritoGuardado));
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ========================================
  //  REPUESTOS
  // ========================================

  obtenerTodos(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerCompatibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/compatibles`, { headers: this.getHeaders() });
  }

  obtenerVehiculosUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-vehiculos`, { headers: this.getHeaders() });
  }

  obtenerPorId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ========================================
  //  CARRITO DE COMPRAS
  // ========================================

  agregarAlCarrito(repuesto: any, cantidad: number = 1) {
    const carrito = this.carritoSubject.value;
    const index = carrito.findIndex(item => item.id_repuesto === repuesto.id_repuesto);

    if (index !== -1) {
      // Ya existe, aumentar cantidad
      carrito[index].cantidad += cantidad;

      // Validar que no exceda el stock
      if (carrito[index].cantidad > carrito[index].stock) {
        carrito[index].cantidad = carrito[index].stock;
      }
    } else {
      // Agregar nuevo item
      carrito.push({
        id_repuesto: repuesto.id_repuesto,
        nombre: repuesto.nombre,
        descripcion: repuesto.descripcion,
        precio: repuesto.precio,
        cantidad: cantidad,
        imagen_url: repuesto.imagen_url,
        categoria: repuesto.categoria,
        stock: repuesto.stock
      });
    }

    this.actualizarCarrito(carrito);
  }

  eliminarDelCarrito(id_repuesto: string) {
    const carrito = this.carritoSubject.value.filter(
      item => item.id_repuesto !== id_repuesto
    );
    this.actualizarCarrito(carrito);
  }

  actualizarCantidad(id_repuesto: string, cantidad: number) {
    const carrito = this.carritoSubject.value;
    const index = carrito.findIndex(item => item.id_repuesto === id_repuesto);

    if (index !== -1) {
      carrito[index].cantidad = cantidad;

      // Validar límites
      if (carrito[index].cantidad > carrito[index].stock) {
        carrito[index].cantidad = carrito[index].stock;
      }
      if (carrito[index].cantidad < 1) {
        carrito[index].cantidad = 1;
      }

      this.actualizarCarrito(carrito);
    }
  }

  vaciarCarrito() {
    this.actualizarCarrito([]);
  }

  private actualizarCarrito(carrito: ItemCarrito[]) {
    this.carritoSubject.next(carrito);
    localStorage.setItem('carrito_repuestos', JSON.stringify(carrito));
  }

  obtenerCarrito(): ItemCarrito[] {
    return this.carritoSubject.value;
  }

  obtenerTotalCarrito(): number {
    return this.carritoSubject.value.reduce(
      (total, item) => total + (item.precio * item.cantidad),
      0
    );
  }

  obtenerCantidadItems(): number {
    return this.carritoSubject.value.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }

  // ========================================
  //  COMPRAS
  // ========================================

  procesarCompra(id_repuesto: string, id_tarjeta: string, cantidad: number): Observable<any> {
    return this.http.post(
      this.comprasUrl,
      { id_repuesto, id_tarjeta, cantidad },
      { headers: this.getHeaders() }
    );
  }

  obtenerHistorialCompras(): Observable<any> {
    return this.http.get(
      `${this.comprasUrl}/historial`,
      { headers: this.getHeaders() }
    );
  }

  obtenerCompraPorId(id_compra: string): Observable<any> {
    return this.http.get(
      `${this.comprasUrl}/${id_compra}`,
      { headers: this.getHeaders() }
    );
  }
}