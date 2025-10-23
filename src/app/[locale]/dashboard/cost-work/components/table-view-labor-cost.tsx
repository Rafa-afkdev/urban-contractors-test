"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { LaborCost } from "../../../../../../interfaces/labor-cost.interface";
import { CreateUpdateLaborCost } from "./create-update-labor-cost";
import { useTranslations } from "next-intl";
import { ConfirmDeletionLaborCost } from "./confirm-deletion-labor-cost";

interface TableLaborCostViewProps {
  laborCosts: LaborCost[];
  getLaborCosts: () => Promise<void>;
  deleteLaborCost: (laborCost: LaborCost) => Promise<void>;
  isLoading: boolean;
}

export function TableLaborCostView({
  laborCosts,
  getLaborCosts,
  deleteLaborCost,
  isLoading,
}: TableLaborCostViewProps) {
  const t = useTranslations("TableLaborCost");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (laborCosts.length === 0) {
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
              <TableHead className="w-[250px]">{t("headerService")}</TableHead>
              <TableHead className="w-[150px]">{t("headerCost")}</TableHead>
              <TableHead className="w-[250px]">{t("headerDescription")}</TableHead>
              <TableHead className="w-[120px] text-center">{t("headerActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {laborCosts.map((laborCost) => (
              <TableRow key={laborCost.id}>
                <TableCell className="font-medium text-sm">{laborCost.nombre_servicio}</TableCell>
                <TableCell className="font-medium text-sm">
                  ${laborCost.costo_mano_obra?.toFixed(2)}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {laborCost.descripcion || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 justify-center">
                    <CreateUpdateLaborCost
                      laborCostToUpdate={laborCost}
                      getLaborCosts={getLaborCosts}
                    >
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CreateUpdateLaborCost>

                    <ConfirmDeletionLaborCost
                      laborCost={laborCost}
                      deleteLaborCost={deleteLaborCost}
                    >
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </ConfirmDeletionLaborCost>
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
