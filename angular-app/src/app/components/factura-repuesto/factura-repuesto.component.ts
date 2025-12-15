import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RepuestoService } from '../../services/repuesto.service';
import { UsuarioService } from '../../services/usuario.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-factura-repuesto',
  standalone: false,
  templateUrl: './factura-repuesto.component.html',
  styleUrl: './factura-repuesto.component.css'
})
export class FacturaRepuestoComponent implements OnInit {
  compra: any = null;
  cargando = true;
  generandoPDF = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private repuestoService: RepuestoService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    // Verificar autenticación
    if (!this.usuarioService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    // Obtener ID de la compra desde la ruta
    const id_compra = this.route.snapshot.paramMap.get('id');
    if (id_compra) {
      this.cargarFactura(id_compra);
    } else {
      this.router.navigate(['/historial-compras']);
    }
  }

  cargarFactura(id_compra: string) {
    this.cargando = true;
    this.repuestoService.obtenerCompraPorId(id_compra).subscribe({
      next: (response: any) => {
        this.compra = response.data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar factura:', err);
        alert('Error al cargar la factura');
        this.router.navigate(['/historial-compras']);
      }
    });
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

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Factura-${this.compra.numero_factura}.pdf`);

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

  volver() {
    this.router.navigate(['/historial-compras']);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  enmascaradoTarjeta(numero: string): string {
    return numero ? `**** **** **** ${numero.slice(-4)}` : '**** **** **** ****';
  }
}