"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Client } from "../../../../../../interfaces/clients.interface";
import { Project } from "../../../../../../interfaces/projects.interface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Wrench } from "lucide-react";

interface ViewClientProjectsProps {
  children: React.ReactNode;
  client: Client;
  projects: Project[];
  stats: {
    total: number;
    completados: number;
    enProceso: number;
    cancelados: number;
  };
}

export function ViewClientProjects({
  children,
  client,
  projects,
  stats,
}: ViewClientProjectsProps) {
  const t = useTranslations("ViewClientProjects");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EN_PROCESO":
        return <Badge className="bg-blue-500">{t("statusInProgress")}</Badge>;
      case "COMPLETADO":
        return <Badge className="bg-green-500">{t("statusCompleted")}</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-500">{t("statusCanceled")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalGastado = projects.reduce((sum, p) => sum + (p.total_proyecto || 0), 0);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
          <DialogDescription>
            {client.nombre} {client.apellido}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información del Cliente */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("email")}
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">{client.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("phone")}
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">{client.telefono}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("address")}
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {client.direccion}, {client.ciudad}, {client.estado} {client.codigo_postal}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("totalProjects")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completados}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("completed")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.enProceso}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("inProgress")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-orange-600">${totalGastado.toFixed(2)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("totalSpent")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Proyectos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("projectsList")}</h3>
            {projects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t("noProjects")}</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(project.status)}
                            <span className="text-sm text-gray-500">
                              {t("project")} #{project.id?.slice(-6)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            {formatDate(project.fecha_inicio)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">
                            ${project.total_proyecto?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>

                      {/* Servicios del Proyecto */}
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <Wrench className="inline w-4 h-4 mr-1" />
                          {t("services")} ({project.servicios?.length || 0})
                        </p>
                        <div className="space-y-2">
                          {project.servicios?.map((servicio, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {servicio.nombre_servicio}
                                  </p>
                                  {servicio.descripcion_trabajo && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {servicio.descripcion_trabajo}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right ml-2">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    ${servicio.total_servicio?.toFixed(2) || "0.00"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trabajador */}
                      {project.trabajador_nombre && (
                        <div className="border-t pt-3 mt-3">
                          <p className="text-xs text-gray-500">
                            {t("worker")}: {project.trabajador_nombre}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
