import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepuestoService } from '../../services/repuesto.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-historial-compras',
  standalone: false,
  templateUrl: './historial-compras.component.html',
  styleUrl: './historial-compras.component.css'
})
export class HistorialComprasComponent implements OnInit {
  compras: any[] = [];
  cargando = true;
  error = '';

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

    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargando = true;
    this.repuestoService.obtenerHistorialCompras().subscribe({
      next: (response: any) => {
        this.compras = response.data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar historial:', err);
        this.error = 'Error al cargar el historial de compras';
        this.cargando = false;
      }
    });
  }

  verFactura(id_compra: string) {
    this.router.navigate(['/factura-repuesto', id_compra]);
  }

  irARepuestos() {
    this.router.navigate(['/repuestos']);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerUltimosDigitos(numero: string): string {
    return numero ? numero.slice(-4) : '****';
  }
}