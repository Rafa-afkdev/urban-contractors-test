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
import { LaborCost } from "../../../../../../interfaces/labor-cost.interface";
import { useTranslations } from "next-intl";

interface ConfirmDeletionLaborCostProps {
  children: React.ReactNode;
  laborCost: LaborCost;
  deleteLaborCost: (laborCost: LaborCost) => Promise<void>;
}

export function ConfirmDeletionLaborCost({
  children,
  laborCost,
  deleteLaborCost,
}: ConfirmDeletionLaborCostProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("ConfirmDeletionLaborCost");

  const handleDelete = async () => {
    await deleteLaborCost(laborCost);
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
            <strong>{laborCost.nombre_servicio}</strong>
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
