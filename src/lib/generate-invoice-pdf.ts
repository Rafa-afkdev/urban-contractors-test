'use server';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Project } from '../../interfaces/projects.interface';
import fs from 'fs';
import path from 'path';

// Traducciones
const translations = {
  es: {
    invoice: 'FACTURA',
    date: 'Fecha',
    clientInfo: 'INFORMACIÓN DEL CLIENTE',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    address: 'Dirección',
    status: 'Estado',
    servicesDetail: 'DETALLE DE SERVICIOS',
    service: 'Servicio',
    description: 'Descripción',
    measurement: 'Medida',
    price: 'Precio',
    total: 'Total',
    projectTotal: 'TOTAL',
    noteTitle: 'NOTA IMPORTANTE',
    noteText1: 'Esta es una factura proforma. Los precios pueden variar según las',
    noteText2: 'condiciones finales del proyecto.',
    footer: 'Gracias por confiar en Urban Contractors',
    linearFoot: 'pie lineal',
    squareFoot: 'pie cuadrado',
    statusInProgress: 'EN PROCESO',
    statusCompleted: 'COMPLETADO',
    statusCanceled: 'CANCELADO',
  },
  en: {
    invoice: 'INVOICE',
    date: 'Date',
    clientInfo: 'CLIENT INFORMATION',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    status: 'Status',
    servicesDetail: 'SERVICES DETAIL',
    service: 'Service',
    description: 'Description',
    measurement: 'Measurement',
    price: 'Price',
    total: 'Total',
    projectTotal: 'TOTAL',
    noteTitle: 'IMPORTANT NOTE',
    noteText1: 'This is a proforma invoice. Prices may vary according to the',
    noteText2: 'final conditions of the project.',
    footer: 'Thank you for trusting Urban Contractors',
    linearFoot: 'linear foot',
    squareFoot: 'square foot',
    statusInProgress: 'IN PROGRESS',
    statusCompleted: 'COMPLETED',
    statusCanceled: 'CANCELED',
  }
};

export async function generateInvoicePDF(project: Project, locale: string = 'es'): Promise<Buffer> {
  try {
    const t = translations[locale as keyof typeof translations] || translations.es;
    
    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();
    
    // Agregar una página
    let page = pdfDoc.addPage([595, 842]); // Tamaño A4
    const { width, height } = page.getSize();
    
    // Cargar fuentes con mejor calidad
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Cargar el logo
    let logoImage;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'Logo-Dark.png');
      const logoImageBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoImageBytes);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
    
    let yPosition = height - 70;
    
    // ===== ENCABEZADO LIMPIO =====
    // Logo centrado más grande
    if (logoImage) {
      const logoWidth = 150;
      const logoHeight = 100;
      page.drawImage(logoImage, {
        x: (width - logoWidth) / 2,
        y: yPosition - logoHeight,
        width: logoWidth,
        height: logoHeight,
      });
      yPosition -= logoHeight + 15;
    }
    
    // Fecha debajo del logo
    const currentDate = new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const dateLabel = `${t.date.toUpperCase()}: ${currentDate}`;
    const dateLabelWidth = fontBold.widthOfTextAtSize(dateLabel, 10);
    page.drawText(dateLabel, {
      x: (width - dateLabelWidth) / 2,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 40;
    
    // ===== INFORMACIÓN DEL CLIENTE =====
    // Título
    page.drawText(t.clientInfo.toUpperCase(), {
      x: 70,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 25;
    
    // Traducir estado
    let statusText: string = project.status;
    if (project.status === 'EN_PROCESO') statusText = t.statusInProgress;
    else if (project.status === 'COMPLETADO') statusText = t.statusCompleted;
    else if (project.status === 'CANCELADO') statusText = t.statusCanceled;
    
    // Columna izquierda - Datos del cliente
    const leftData = [
      project.cliente_nombre,
      project.cliente_telefono,
      project.cliente_direccion.substring(0, 35),
      statusText
    ];
    
    let tempY = yPosition;
    leftData.forEach(text => {
      page.drawText(text, {
        x: 70,
        y: tempY,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      tempY -= 16;
    });
    
    yPosition -= 85;
    
    // ===== TABLA DE SERVICIOS =====
    // Título
    page.drawText(t.servicesDetail.toUpperCase(), {
      x: 70,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 25;
    
    // Encabezados de tabla - estilo simple
    const tableHeaders = [t.description, t.measurement, t.price];
    const columnWidths = [280, 120, 75];
    let xPosition = 70;
    
    // Línea superior de la tabla
    page.drawLine({
      start: { x: 70, y: yPosition },
      end: { x: width - 70, y: yPosition },
      thickness: 1.5,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 20;
    
    // Dibujar encabezados
    tableHeaders.forEach((header, index) => {
      let xPos = xPosition + 5;
      
      // Alinear a la derecha precio
      if (index === 2) {
        const textWidth = fontBold.widthOfTextAtSize(header, 10);
        xPos = xPosition + columnWidths[index] - textWidth - 5;
      }
      
      page.drawText(header, {
        x: xPos,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      xPosition += columnWidths[index];
    });
    
    yPosition -= 8;
    
    // Línea debajo de encabezados
    page.drawLine({
      start: { x: 70, y: yPosition },
      end: { x: width - 70, y: yPosition },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    
    yPosition -= 18;
    
    // Dibujar servicios
    project.servicios?.forEach((service, index) => {
      // Verificar si necesitamos una nueva página
      if (yPosition < 100) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
      }
      
      // Preparar datos
      const medida = service.usa_pie_lineal 
        ? `${service.pie_lineal} LF` 
        : service.usa_pie_cuadrado 
        ? `${service.pie_cuadrado} FT²` 
        : 'N/A';
      
      const descripcion = service.descripcion_trabajo || service.descripcion_servicio || '';
      const fullDescription = `${service.nombre_servicio} - ${descripcion}`;
      const descripcionCorta = fullDescription.length > 45 ? fullDescription.substring(0, 45) + '...' : fullDescription;
      
      // Columna Descripción (280px)
      xPosition = 70;
      page.drawText(descripcionCorta, {
        x: xPosition + 5,
        y: yPosition,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      // Columna Medida (120px)
      xPosition += 280;
      page.drawText(medida, {
        x: xPosition + 5,
        y: yPosition,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      // Columna Precio (75px) - alineado a la derecha
      xPosition += 120;
      const precioText = `$${service.total_servicio?.toFixed(2) || '0.00'}`;
      const precioWidth = fontRegular.widthOfTextAtSize(precioText, 10);
      page.drawText(precioText, {
        x: xPosition + 75 - precioWidth - 5,
        y: yPosition,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      yPosition -= 20;
    });
    
    yPosition -= 10;
    
    // Línea superior del total
    page.drawLine({
      start: { x: 70, y: yPosition },
      end: { x: width - 70, y: yPosition },
      thickness: 1.5,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 25;
    
    // ===== TOTAL =====
    // Texto TOTAL alineado a la derecha
    const totalLabel = t.projectTotal.toUpperCase();
    const totalText = `$${project.total_proyecto?.toFixed(2) || '0.00'}`;
    
    page.drawText(totalLabel, {
      x: width - 220,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    const totalTextWidth = fontBold.widthOfTextAtSize(totalText, 11);
    page.drawText(totalText, {
      x: width - 75 - totalTextWidth,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 15;
    
    // Línea inferior del total
    page.drawLine({
      start: { x: width - 220, y: yPosition },
      end: { x: width - 70, y: yPosition },
      thickness: 2,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 40;
    
    // ===== OBSERVACIONES =====
    if (yPosition < 150) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    
    // Título de observaciones
    const observationsTitle = locale === 'es' ? 'NOTA DEL SERVICIO' : 'SERVICE NOTE';
    page.drawText(observationsTitle, {
      x: 70,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    yPosition -= 20;
    
    // Caja de observaciones
    const boxHeight = 70;
    page.drawRectangle({
      x: 70,
      y: yPosition - boxHeight,
      width: width - 140,
      height: boxHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.5, 0.5, 0.5),
      borderWidth: 1,
    });
    
    // Texto de las notas del proyecto dentro de la caja
    const projectNotes = project.notas || (locale === 'es' 
      ? 'Esta es una factura proforma. Los precios pueden variar según las condiciones finales del proyecto.'
      : 'This is a proforma invoice. Prices may vary according to the final conditions of the project.');
    
    // Dividir el texto en líneas si es muy largo
    const maxCharsPerLine = 75;
    const lines: string[] = [];
    let currentLine = '';
    
    projectNotes.split(' ').forEach(word => {
      if ((currentLine + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Dibujar las líneas (máximo 4 líneas)
    let noteY = yPosition - 20;
    lines.slice(0, 4).forEach(line => {
      page.drawText(line, {
        x: 80,
        y: noteY,
        size: 9,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
      noteY -= 13;
    });
    
    yPosition -= boxHeight + 20;
    
    // Líneas para firmas
    const lineY = yPosition - 40;
    const line1X = 70;
    const line2X = width / 2 + 20;
    const lineWidth = 180;
    
    // Línea 1
    page.drawLine({
      start: { x: line1X, y: lineY },
      end: { x: line1X + lineWidth, y: lineY },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Línea 2
    page.drawLine({
      start: { x: line2X, y: lineY },
      end: { x: line2X + lineWidth, y: lineY },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // ===== FOOTER SIMPLE =====
    const footerText = 'Urban Contractors';
    const footerWidth = fontRegular.widthOfTextAtSize(footerText, 9);
    page.drawText(footerText, {
      x: (width - footerWidth) / 2,
      y: 40,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Guardar el PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
