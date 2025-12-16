import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacturaService } from '../../services/factura.service';
import { UsuarioService } from '../../services/usuario.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-facturas',
  standalone: false,
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css'
})
export class FacturasComponent implements OnInit {
  facturas: any[] = [];
  facturaSeleccionada: any = null;
  cargando = true;
  mostrandoFactura = false;
  generandoPDF = false;

  constructor(
    private facturaService: FacturaService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar que el usuario esté autenticado
    if (!this.usuarioService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    this.cargarFacturas();
  }

  cargarFacturas() {
    this.cargando = true;
    this.facturaService.obtenerHistorial().subscribe({
      next: (response: any) => {
        console.log('📦 Facturas recibidas:', response.data);
        console.log('📦 Primera factura:', response.data[0]);
        this.facturas = response.data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar facturas:', err);
        this.cargando = false;
      }
    });
  }

  verFactura(id_factura: string, id_cita?: string) {
    this.mostrandoFactura = true;

    // ✅ Intentar primero con id_cita si existe
    if (id_cita) {
      this.facturaService.obtenerFacturaPorCita(id_cita).subscribe({
        next: (response: any) => {
          this.facturaSeleccionada = response.data;
        },
        error: err => {
          console.error('Error al cargar factura por cita:', err);
          // Si falla, intentar por id_factura
          this.intentarPorIdFactura(id_factura);
        }
      });
    } else {
      this.intentarPorIdFactura(id_factura);
    }
  }

  intentarPorIdFactura(id_factura: string) {
    this.facturaService.obtenerFacturaPorId(id_factura).subscribe({
      next: (response: any) => {
        this.facturaSeleccionada = response.data;
      },
      error: err => {
        console.error('Error al cargar factura:', err);
        alert('Error al cargar la factura');
        this.mostrandoFactura = false;
      }
    });
  }

  cerrarFactura() {
    this.mostrandoFactura = false;
    this.facturaSeleccionada = null;
  }

  async descargarPDF() {
    const facturaElement = document.getElementById('factura-pdf');
    if (!facturaElement) return;

    this.generandoPDF = true;

    try {
      const canvas = await html2canvas(facturaElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Factura-${this.facturaSeleccionada.numero_factura}.pdf`);

      this.generandoPDF = false;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
      this.generandoPDF = false;
    }
  }

  imprimirFactura() {
    window.print();
  }

  volverAHistorial() {
    this.router.navigate(['/historial-citas']);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }
}