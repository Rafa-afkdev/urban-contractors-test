"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, LoaderCircle } from "lucide-react";
import { Project } from "../../../../../../interfaces/projects.interface";
import { useTranslations, useLocale } from "next-intl";
import { showToast } from "nextjs-toast-notify";
import { SendEmailWithAttachments } from "@/lib/resend";
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf";

interface SendInvoiceEmailProps {
  project: Project;
  children: React.ReactNode;
}

export function SendInvoiceEmail({ project, children }: SendInvoiceEmailProps) {
  const t = useTranslations("SendInvoiceEmail");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateInvoiceHTML = () => {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let servicesHTML = '';
    project.servicios?.forEach((service, index) => {
      const medida = service.usa_pie_lineal 
        ? `${service.pie_lineal} pie lineal` 
        : service.usa_pie_cuadrado 
        ? `${service.pie_cuadrado} pie cuadrado` 
        : 'N/A';

      servicesHTML += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: left;">${index + 1}</td>
          <td style="padding: 12px; text-align: left;">
            <strong>${service.nombre_servicio}</strong><br/>
            <small style="color: #6b7280;">${service.descripcion_trabajo || service.descripcion_servicio}</small>
          </td>
          <td style="padding: 12px; text-align: center;">${medida}</td>
          <td style="padding: 12px; text-align: right;">$${service.precio_base?.toFixed(2) || '0.00'}</td>
          <td style="padding: 12px; text-align: right;">$${service.subtotal_servicio?.toFixed(2) || '0.00'}</td>
          <td style="padding: 12px; text-align: right;">$${service.subtotal_materiales?.toFixed(2) || '0.00'}</td>
          <td style="padding: 12px; text-align: right;">$${((service.costo_mano_obra || 0) * (service.usa_pie_lineal ? (service.pie_lineal || 0) : (service.pie_cuadrado || 0))).toFixed(2)}</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; color: #059669;">$${service.total_servicio?.toFixed(2) || '0.00'}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura - Urban Contractors</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">FACTURA</h1>
          <p style="margin: 5px 0 0 0; font-size: 18px;">Urban Contractors</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3 style="margin: 0 0 10px 0; color: #f97316;">Información del Cliente</h3>
              <p style="margin: 5px 0;"><strong>Nombre:</strong> ${project.cliente_nombre}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${project.cliente_email}</p>
              <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${project.cliente_telefono}</p>
              <p style="margin: 5px 0;"><strong>Dirección:</strong> ${project.cliente_direccion}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${currentDate}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${project.status}</span></p>
            </div>
          </div>
        </div>

        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 15px 0; color: #f97316;">Detalle de Servicios</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #f97316;">
                <th style="padding: 12px; text-align: left;">#</th>
                <th style="padding: 12px; text-align: left;">Servicio</th>
                <th style="padding: 12px; text-align: center;">Medida</th>
                <th style="padding: 12px; text-align: right;">Precio Base</th>
                <th style="padding: 12px; text-align: right;">Subtotal</th>
                <th style="padding: 12px; text-align: right;">Materiales</th>
                <th style="padding: 12px; text-align: right;">Mano de Obra</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHTML}
            </tbody>
          </table>
        </div>

        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 0 0 10px 10px;">
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 28px;">TOTAL: $${project.total_proyecto?.toFixed(2) || '0.00'}</h2>
          </div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;"><strong>Nota:</strong> Esta es una factura proforma. Los precios pueden variar según las condiciones del proyecto.</p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Gracias por confiar en Urban Contractors</p>
          <p>© ${new Date().getFullYear()} Urban Contractors. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;
  };

  // Función helper para convertir Timestamps a objetos planos
  const convertTimestampsToPlain = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Si es un Timestamp de Firebase
    if ('seconds' in obj && 'nanoseconds' in obj) {
      return new Date(obj.seconds * 1000).toISOString();
    }
    
    // Si es un Date
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    // Si es un array
    if (Array.isArray(obj)) {
      return obj.map(item => convertTimestampsToPlain(item));
    }
    
    // Si es un objeto, convertir recursivamente
    const result: any = {};
    for (const key in obj) {
      result[key] = convertTimestampsToPlain(obj[key]);
    }
    return result;
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      // Convertir el proyecto a un objeto plano (sin Timestamps de Firebase)
      const plainProject = convertTimestampsToPlain(project);
      
      // Generar el PDF con el idioma actual
      const pdfBuffer = await generateInvoicePDF(plainProject, locale);
      
      // Generar el HTML del email
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Factura de Proyecto</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Urban Contractors</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Estimado/a <strong>${project.cliente_nombre}</strong>,</p>
            
            <p style="font-size: 14px; line-height: 1.8; color: #555;">
              Adjunto encontrará la factura detallada de su proyecto con Urban Contractors. 
              Este documento incluye el desglose completo de todos los servicios, materiales y costos de mano de obra.
            </p>
            
            <div style="background: #f9fafb; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px;"><strong>Total del Proyecto:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 24px; color: #059669; font-weight: bold;">
                $${project.total_proyecto?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.8; color: #555;">
              Si tiene alguna pregunta sobre esta factura o necesita información adicional, 
              no dude en contactarnos. Estamos aquí para ayudarle.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
                <strong>Urban Contractors</strong><br/>
                Email: noreply@urbcontractors.com<br/>
                Teléfono: (XXX) XXX-XXXX
              </p>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              Gracias por confiar en Urban Contractors
            </p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">
              © ${new Date().getFullYear()} Urban Contractors. Todos los derechos reservados.
            </p>
          </div>
        </body>
        </html>
      `;
      
      const subject = `Factura - Proyecto para ${project.cliente_nombre}`;
      const fileName = `Factura_${project.cliente_nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Enviar email con PDF adjunto via Resend
      await SendEmailWithAttachments(
        project.cliente_email,
        subject,
        emailHTML,
        [{
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      );
      
      showToast.success(t("successMessage"), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
      
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      showToast.error(error.message || t("errorMessage"), {
        duration: 2500,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-orange-500" />
            {t("title")}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información del Cliente */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t("clientInfo")}</h4>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">{t("name")}:</span> {project.cliente_nombre}
              </p>
              <p>
                <span className="font-medium">{t("email")}:</span> {project.cliente_email}
              </p>
              <p>
                <span className="font-medium">{t("phone")}:</span> {project.cliente_telefono}
              </p>
            </div>
          </div>

          {/* Resumen de Servicios */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t("servicesInfo")}</h4>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">{t("totalServices")}:</span> {project.servicios?.length || 0}
              </p>
              <p>
                <span className="font-medium">{t("projectTotal")}:</span>{" "}
                <span className="text-green-600 dark:text-green-400 font-bold">
                  ${project.total_proyecto?.toFixed(2) || "0.00"}
                </span>
              </p>
            </div>
          </div>

          {/* Mensaje de confirmación */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t("confirmMessage")}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            <Mail className="mr-2 h-4 w-4" />
            {t("sendButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
