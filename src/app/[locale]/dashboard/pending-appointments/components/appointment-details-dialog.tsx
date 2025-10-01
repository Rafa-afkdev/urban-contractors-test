"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Scheludes } from "../../../../../../interfaces/scheludes.interface";

interface AppointmentDetailsDialogProps {
  appointment: Scheludes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalles de la Cita
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Información completa de la cita agendada
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Cliente Info */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
              <span className="text-xl">👤</span>
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">
                  Nombre Completo
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {appointment.nombre} {appointment.apellido}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {appointment.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">
                  Teléfono
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {appointment.telefono}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <span className="text-xl">📅</span>
              Información de la Cita
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Fecha
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {appointment.fecha instanceof Date 
                    ? appointment.fecha.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : appointment.fecha}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Hora
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {appointment.hora}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Estado
                </p>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
              <span className="text-xl">📍</span>
              Dirección
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
                  Dirección Principal
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {appointment.direccion}
                </p>
              </div>
              {appointment.direccion2 && (
                <div>
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
                    Dirección Secundaria
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {appointment.direccion2}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
                    Ciudad
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {appointment.ciudad}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
                    Estado
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {appointment.estado}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
                    Código Postal
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {appointment.codigo_postal}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notas && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Notas Adicionales
              </h3>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {appointment.notas}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Creada el: {appointment.createdAt?.toDate?.()?.toLocaleString('es-ES') || 'N/A'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
