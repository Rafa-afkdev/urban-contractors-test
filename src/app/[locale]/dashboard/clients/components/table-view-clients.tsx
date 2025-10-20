"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Client } from "../../../../../../interfaces/clients.interface";
import { Project } from "../../../../../../interfaces/projects.interface";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ViewClientProjects } from "./view-client-projects";

interface TableViewClientsProps {
  clients: Client[];
  getClientStats: (clientId: string) => {
    total: number;
    completados: number;
    enProceso: number;
    cancelados: number;
  };
  getClientProjects: (clientId: string) => Project[];
  isLoading: boolean;
}

export function TableViewClients({
  clients,
  getClientStats,
  getClientProjects,
  isLoading,
}: TableViewClientsProps) {
  const t = useTranslations("TableClients");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calcular paginación
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = clients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generar números de página
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <p>{t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-slate-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[200px]">{t("headerClient")}</TableHead>
                <TableHead className="w-[200px]">{t("headerContact")}</TableHead>
                <TableHead className="w-[150px]">{t("headerLocation")}</TableHead>
                <TableHead className="w-[120px] text-center">{t("headerCompleted")}</TableHead>
                <TableHead className="w-[120px] text-center">{t("headerInProgress")}</TableHead>
                <TableHead className="w-[120px] text-center">{t("headerCanceled")}</TableHead>
                <TableHead className="w-[100px] text-center">{t("headerActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.map((client) => {
                const stats = getClientStats(client.id!);
                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-sm">
                      <div>
                        <p className="font-semibold">{client.nombre} {client.apellido}</p>
                        <p className="text-xs text-gray-500">{t("totalProjects")}: {stats.total}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      <div>
                        <p className="text-sm">{client.email}</p>
                        <p className="text-xs text-gray-500">{client.telefono}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-gray-600">
                      <div>
                        <p className="text-sm">{client.ciudad}</p>
                        <p className="text-xs text-gray-500">{client.estado}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {stats.completados}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {stats.enProceso}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {stats.cancelados}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <ViewClientProjects
                          client={client}
                          projects={getClientProjects(client.id!)}
                          stats={stats}
                        >
                          <Button variant="ghost" size="icon" title={t("viewProjects") || "Ver proyectos"}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </ViewClientProjects>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(page as number)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
