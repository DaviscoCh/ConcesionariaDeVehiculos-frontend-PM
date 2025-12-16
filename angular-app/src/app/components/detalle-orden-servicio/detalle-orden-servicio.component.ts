import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdenServicioService, OrdenServicio } from '../../services/orden-servicio.service';
import { FacturaService } from '../../services/factura.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-orden-servicio',
  standalone: false,
  templateUrl: './detalle-orden-servicio.component.html',
  styleUrls: ['./detalle-orden-servicio.component.css']
})
export class DetalleOrdenServicioComponent implements OnInit {
  orden: OrdenServicio | null = null;
  id_orden: string = '';
  loading: boolean = true;
  error: string = '';

  // Calificación
  mostrarFormCalificacion: boolean = false;
  calificacion: number = 0;
  comentario: string = '';
  enviandoCalificacion: boolean = false;

  // Factura
  facturaOrden: any = null;
  mostrandoFactura: boolean = false;
  cargandoFactura: boolean = false;
  generandoPDF: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordenService: OrdenServicioService,
    private facturaService: FacturaService
  ) { }

  ngOnInit(): void {
    this.id_orden = this.route.snapshot.paramMap.get('id') || '';

    if (!this.id_orden) {
      this.router.navigate(['/mis-ordenes-servicio']);
      return;
    }

    this.cargarOrden();
  }

  cargarOrden(): void {
    this.loading = true;
    this.ordenService.getOrdenById(this.id_orden).subscribe({
      next: (data: any) => {
        this.orden = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar orden:', err);
        this.error = 'Error al cargar los detalles de la orden';
        this.loading = false;
      }
    });
  }

  // ========================================
  // VER FACTURA DE LA ORDEN
  // ========================================
  verFacturaOrden(): void {
    if (!this.orden || this.orden.estado !== 'Completado') {
      Swal.fire({
        icon: 'warning',
        title: 'Orden no completada',
        text: 'Solo se pueden ver facturas de órdenes completadas',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    Swal.fire({
      title: 'Cargando factura...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.cargandoFactura = true;
    this.facturaService.obtenerFacturaPorOrden(this.id_orden).subscribe({
      next: (response: any) => {
        this.facturaOrden = response.data;
        this.mostrandoFactura = true;
        this.cargandoFactura = false;
        Swal.close();
      },
      error: (err: any) => {
        console.error('Error al cargar factura:', err);

        if (err.status === 404) {
          Swal.fire({
            title: 'Factura no encontrada',
            text: '¿Deseas generar la factura ahora?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#6c757d'
          }).then((result) => {
            if (result.isConfirmed) {
              this.generarFacturaOrden();
            } else {
              this.cargandoFactura = false;
            }
          });
        } else {
          this.cargandoFactura = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la factura',
            confirmButtonColor: '#007bff'
          });
        }
      }
    });
  }

  // ========================================
  // GENERAR FACTURA SI NO EXISTE
  // ========================================
  generarFacturaOrden(): void {
    Swal.fire({
      title: 'Generando factura...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.facturaService.generarFacturaDesdeOrden(this.id_orden).subscribe({
      next: (response: any) => {
        console.log('Factura generada exitosamente');
        this.verFacturaOrden();
      },
      error: (err: any) => {
        console.error('Error al generar factura:', err);
        this.cargandoFactura = false;

        Swal.fire({
          icon: 'error',
          title: 'Error al generar factura',
          text: err.error?.error || 'No se pudo generar la factura',
          confirmButtonColor: '#007bff'
        });
      }
    });
  }

  // ========================================
  // CERRAR MODAL DE FACTURA
  // ========================================
  cerrarFactura(): void {
    this.mostrandoFactura = false;
    this.facturaOrden = null;
  }

  // ========================================
  // DESCARGAR FACTURA COMO PDF
  // ========================================
  async descargarFacturaPDF(): Promise<void> {
    const facturaElement = document.getElementById('factura-mantenimiento-pdf');
    if (!facturaElement) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró la factura para descargar',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    this.generandoPDF = true;

    Swal.fire({
      title: 'Generando PDF...',
      text: 'Por favor espera mientras se genera el documento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

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
      pdf.save(`Factura-Mantenimiento-${this.facturaOrden.numero_factura}.pdf`);

      this.generandoPDF = false;

      Swal.fire({
        icon: 'success',
        title: '¡PDF descargado!',
        text: 'La factura se ha descargado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.generandoPDF = false;

      Swal.fire({
        icon: 'error',
        title: 'Error al generar PDF',
        text: 'No se pudo generar el documento',
        confirmButtonColor: '#007bff'
      });
    }
  }

  // ========================================
  // IMPRIMIR FACTURA
  // ========================================
  imprimirFactura(): void {
    window.print();
  }

  volver(): void {
    this.router.navigate(['/mis-ordenes-servicio']);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Guayaquil',
      hour12: false
    };
    return date.toLocaleString('es-EC', opciones);
  }

  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'Pendiente': 'estado-pendiente',
      'Aprobado': 'estado-aprobado',
      'En Proceso': 'estado-proceso',
      'Completado': 'estado-completado',
      'Cancelado': 'estado-cancelado'
    };
    return clases[estado] || 'estado-default';
  }

  getEstadoIcono(estado: string): string {
    const iconos: { [key: string]: string } = {
      'Pendiente': '⏳',
      'Aprobado': '✅',
      'En Proceso': '🔧',
      'Completado': '🎉',
      'Cancelado': '❌'
    };
    return iconos[estado] || '📋';
  }

  // ========================================
  // ABRIR FORMULARIO DE CALIFICACIÓN
  // ========================================
  abrirFormCalificacion(): void {
    if (!this.orden || this.orden.estado !== 'Completado') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Solo puedes calificar órdenes completadas',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    if (this.orden.calificacion) {
      Swal.fire({
        icon: 'info',
        title: 'Ya calificado',
        text: 'Ya has calificado esta orden',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    this.mostrarFormCalificacion = true;
  }

  cerrarFormCalificacion(): void {
    this.mostrarFormCalificacion = false;
    this.calificacion = 0;
    this.comentario = '';
  }

  setCalificacion(valor: number): void {
    this.calificacion = valor;
  }

  // ========================================
  // ENVIAR CALIFICACIÓN
  // ========================================
  enviarCalificacion(): void {
    if (this.calificacion === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Calificación requerida',
        text: 'Por favor selecciona una calificación de 1 a 5 estrellas',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    if (!this.comentario.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Comentario requerido',
        text: 'Por favor escribe un comentario sobre tu experiencia',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    this.enviandoCalificacion = true;

    Swal.fire({
      title: 'Enviando calificación...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.ordenService.calificarServicio(this.id_orden, this.calificacion, this.comentario).subscribe({
      next: () => {
        this.enviandoCalificacion = false;
        this.cerrarFormCalificacion();

        Swal.fire({
          icon: 'success',
          title: '¡Gracias por tu calificación!',
          html: `
            <p>Tu opinión nos ayuda a mejorar nuestros servicios</p>
            <div style="font-size: 2rem; margin: 1rem 0;">
              ${'⭐'.repeat(this.calificacion)}
            </div>
          `,
          confirmButtonColor: '#007bff'
        });

        this.cargarOrden();
      },
      error: (err: any) => {
        console.error('Error al calificar:', err);
        this.enviandoCalificacion = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar la calificación. Intenta nuevamente',
          confirmButtonColor: '#007bff'
        });
      }
    });
  }

  // ========================================
  // CANCELAR ORDEN
  // ========================================
  async cancelarOrden(): Promise<void> {
    if (!this.orden) return;

    if (this.orden.estado === 'Completado') {
      Swal.fire({
        icon: 'error',
        title: 'No se puede cancelar',
        text: 'No se puede cancelar una orden completada',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    if (this.orden.estado === 'Cancelado') {
      Swal.fire({
        icon: 'info',
        title: 'Orden ya cancelada',
        text: 'Esta orden ya está cancelada',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    const { value: motivo } = await Swal.fire({
      title: 'Cancelar orden de servicio',
      html: `
        <p style="margin-bottom: 1rem;">Estás a punto de cancelar la orden <strong>${this.orden.numero_orden}</strong></p>
        <p style="color: #666; font-size: 0.9rem;">Esta acción no se puede deshacer</p>
      `,
      input: 'textarea',
      inputLabel: '¿Por qué deseas cancelar esta orden?',
      inputPlaceholder: 'Escribe el motivo de la cancelación...',
      inputAttributes: {
        'aria-label': 'Motivo de cancelación',
        'style': 'min-height: 100px;'
      },
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar orden',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return 'El motivo debe tener al menos 10 caracteres';
        }
        return null;
      }
    });

    if (!motivo) return;

    Swal.fire({
      title: 'Cancelando orden...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.ordenService.cancelarOrden(this.id_orden, motivo).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Orden cancelada',
          text: 'La orden ha sido cancelada exitosamente',
          confirmButtonColor: '#007bff'
        });
        this.cargarOrden();
      },
      error: (err: any) => {
        console.error('Error al cancelar orden:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cancelar la orden. Intenta nuevamente',
          confirmButtonColor: '#007bff'
        });
      }
    });
  }

  formatearPrecio(valor: any): string {
    const numero = Number(valor);
    return isNaN(numero) ? '0.00' : numero.toFixed(2);
  }

  descargarComprobante(): void {
    window.print();
  }
}