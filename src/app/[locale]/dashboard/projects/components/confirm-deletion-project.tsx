"use client";
import React, { useState } from "react";
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
import { Project } from "../../../../../../interfaces/projects.interface";
import { useTranslations } from "next-intl";

interface ConfirmDeletionProjectProps {
  children: React.ReactNode;
  project: Project;
  deleteProject: (project: Project) => Promise<void>;
}

export function ConfirmDeletionProject({
  children,
  project,
  deleteProject,
}: ConfirmDeletionProjectProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("ConfirmDeletionProject");

  const handleDelete = async () => {
    await deleteProject(project);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description")}
            <br />
            <strong>{project.cliente_nombre}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
