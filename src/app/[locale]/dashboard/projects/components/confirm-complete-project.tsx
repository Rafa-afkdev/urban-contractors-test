"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import { Project } from "../../../../../../interfaces/projects.interface";

interface ConfirmCompleteProjectProps {
  children: React.ReactNode;
  project: Project;
  updateProjectStatus: (projectId: string, newStatus: "COMPLETADO" | "CANCELADO") => Promise<void>;
}

export function ConfirmCompleteProject({
  children,
  project,
  updateProjectStatus,
}: ConfirmCompleteProjectProps) {
  const t = useTranslations("ConfirmCompleteProject");

  const handleComplete = () => {
    if (project.id) {
      updateProjectStatus(project.id, "COMPLETADO");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description")}
            <br />
            <span className="font-semibold text-gray-900 dark:text-white mt-2 block">
              {project.cliente_nombre}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {project.servicios?.length || 0} {t("services")} • Total: ${project.total_proyecto?.toFixed(2) || "0.00"}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
