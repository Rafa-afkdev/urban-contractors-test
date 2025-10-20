"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Mail, CheckCircle, XCircle } from "lucide-react";
import { Project } from "../../../../../../interfaces/projects.interface";
import { CreateUpdateProject } from "./create-update-project";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ViewProjectDetails } from "./view-project-details";
import { ConfirmDeletionProject } from "./confirm-deletion-project";
import { SendInvoiceEmail } from "./send-invoice-email";
import { ConfirmCompleteProject } from "./confirm-complete-project";
import { ConfirmCancelProject } from "./confirm-cancel-project";

interface TableProjectsViewProps {
  projects: Project[];
  getProjects: () => Promise<void>;
  deleteProject: (project: Project) => Promise<void>;
  updateProjectStatus: (projectId: string, newStatus: "COMPLETADO" | "CANCELADO") => Promise<void>;
  isLoading: boolean;
}

export function TableProjectsView({
  projects,
  getProjects,
  deleteProject,
  updateProjectStatus,
  isLoading,
}: TableProjectsViewProps) {
  const t = useTranslations("TableProjects");

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <p>{t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-50 dark:bg-gray-800">
            <TableRow>
              <TableHead className="w-[200px]">{t("headerClient")}</TableHead>
              <TableHead className="w-[150px]">{t("headerWorker")}</TableHead>
              <TableHead className="w-[100px]">{t("headerServices")}</TableHead>
              <TableHead className="w-[120px]">{t("headerStatus")}</TableHead>
              <TableHead className="w-[200px]">{t("headerAddress")}</TableHead>
              <TableHead className="w-[200px] text-center">{t("headerActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium text-sm">
                  <div>
                    <p className="font-semibold">{project.cliente_nombre}</p>
                    <p className="text-xs text-gray-500">{project.cliente_email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-sm">
                  <div>
                    <p className="text-sm">{project.trabajador_nombre || 'N/A'}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {project.servicios?.length || 0} {t("services")}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {getStatusBadge(project.status)}
                </TableCell>
                <TableCell className="font-medium text-sm text-gray-600">
                  {project.cliente_direccion}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1 justify-center flex-wrap">
                    <ViewProjectDetails project={project}>
                      <Button variant="ghost" size="icon" title={t("viewDetails") || "Ver detalles"}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </ViewProjectDetails>

                    <SendInvoiceEmail project={project}>
                      <Button variant="ghost" size="icon" title={t("sendInvoice") || "Enviar factura"}>
                        <Mail className="h-4 w-4 text-orange-500" />
                      </Button>
                    </SendInvoiceEmail>

                    {project.status === "EN_PROCESO" && (
                      <>
                        <ConfirmCompleteProject
                          project={project}
                          updateProjectStatus={updateProjectStatus}
                        >
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title={t("markCompleted") || "Marcar como completado"}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        </ConfirmCompleteProject>

                        <ConfirmCancelProject
                          project={project}
                          updateProjectStatus={updateProjectStatus}
                        >
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title={t("markCanceled") || "Marcar como cancelado"}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </ConfirmCancelProject>
                      </>
                    )}

                    <CreateUpdateProject
                      projectToUpdate={project}
                      getProjects={getProjects}
                    >
                      <Button variant="ghost" size="icon" title={t("edit") || "Editar"}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CreateUpdateProject>

                    <ConfirmDeletionProject
                      project={project}
                      deleteProject={deleteProject}
                    >
                      <Button variant="ghost" size="icon" title={t("delete") || "Eliminar"}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </ConfirmDeletionProject>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
