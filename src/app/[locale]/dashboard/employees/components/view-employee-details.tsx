"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Employees } from "../../../../../../interfaces/employees.interface";
import { Mail, Phone, MapPin, Calendar, User, IdCard, Building2, Hash } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ViewEmployeeDetailsProps {
  children: React.ReactNode;
  employee: Employees;
}

export function ViewEmployeeDetails({ children, employee }: ViewEmployeeDetailsProps) {
  const t = useTranslations('ViewEmployeeDetails');
  const statusColors = {
    ACTIVO: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    INACTIVO: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    SUSPENDIDO: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const rolColors = {
    ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    SUPERVISOR: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    TRABAJADOR: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    CONTADOR: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark:text-gray-100">
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sección de Perfil */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            {employee.imagen ? (
              <div className="relative w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-orange-200 dark:border-orange-800 shadow-lg">
                <Image
                  src={employee.imagen.url}
                  alt={`${employee.nombre} ${employee.apellido}`}
                  fill
                  className="object-cover"
                  sizes="180px"
                />
              </div>
            ) : (
              <div className="w-[180px] h-[180px] rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center text-orange-600 dark:text-orange-400 border-4 border-orange-200 dark:border-orange-800 text-4xl font-bold shadow-lg">
                {employee.nombre?.charAt(0)}{employee.apellido?.charAt(0)}
              </div>
            )}
            
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {employee.nombre} {employee.apellido}
              </h3>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge className={`${rolColors[employee.rol as keyof typeof rolColors] || rolColors.TRABAJADOR} rounded-full px-4 py-1 shadow-sm`}>
                  {employee.rol}
                </Badge>
                <Badge className={`${statusColors[employee.status as keyof typeof statusColors] || statusColors.ACTIVO} rounded-full px-4 py-1 shadow-sm`}>
                  {employee.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              {t('sections.personalInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <IdCard className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.cedula')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{employee.cedula}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.phone')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{employee.telefono}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 md:col-span-2">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.email')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{employee.correo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              {t('sections.address')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 md:col-span-2">
                <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.fullAddress')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{employee.direccion}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.city')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{employee.ciudad}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.state')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{employee.estado}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.postalCode')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{employee.codigo_postal}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          {(employee.created_at || employee.updated_at) && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                {t('sections.systemInfo')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.created_at && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.registrationDate')}</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(employee.created_at.seconds * 1000).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {employee.updated_at && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.lastUpdate')}</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(employee.updated_at.seconds * 1000).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}