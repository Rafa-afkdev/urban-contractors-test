"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Project } from "../../../../../../interfaces/projects.interface";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ViewProjectDetailsProps {
  children: React.ReactNode;
  project: Project;
}

export function ViewProjectDetails({
  children,
  project,
}: ViewProjectDetailsProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("ViewProjectDetails");

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Cliente */}
          <div>
            <h3 className="font-semibold text-lg mb-3">{t("clientInfo")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t("clientName")}</p>
                <p className="font-medium">{project.cliente_nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("clientEmail")}</p>
                <p className="font-medium">{project.cliente_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("clientPhone")}</p>
                <p className="font-medium">{project.cliente_telefono}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("status")}</p>
                <div className="mt-1">{getStatusBadge(project.status)}</div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">{t("clientAddress")}</p>
                <p className="font-medium">{project.cliente_direccion}</p>
              </div>
            </div>
          </div>

          {/* Servicios del Proyecto */}
          <div>
            <h3 className="font-semibold text-lg mb-3">{t("services")}</h3>
            <div className="space-y-3">
              {project.servicios && project.servicios.length > 0 ? (
                project.servicios.map((service, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">{service.nombre_servicio}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {service.usa_pie_lineal && (service.pie_lineal ?? 0) > 0 && (
                          <div>
                            <span className="text-gray-500">{t("linearFeet")}:</span>
                            <span className="ml-2 font-medium">{service.pie_lineal} LF</span>
                          </div>
                        )}
                        {service.usa_pie_cuadrado && (service.pie_cuadrado ?? 0) > 0 && (
                          <div>
                            <span className="text-gray-500">{t("squareFeet")}:</span>
                            <span className="ml-2 font-medium">{service.pie_cuadrado} FT²</span>
                          </div>
                        )}
                      </div>
                      {service.nota_servicio && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 mb-1">{t("serviceNote")}:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{service.nota_servicio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-sm">{t("noServices")}</p>
              )}
            </div>
          </div>

          {/* Notas */}
          {project.notas && (
            <div>
              <h3 className="font-semibold text-lg mb-3">{t("notes")}</h3>
              <p className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                {project.notas}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
