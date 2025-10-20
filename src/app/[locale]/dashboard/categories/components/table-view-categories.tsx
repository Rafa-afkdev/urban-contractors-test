/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar ScrollArea
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LayoutList, SquarePen, Trash2 } from "lucide-react";
import { Categorias } from "../../../../../../interfaces/categories.interface";
import { CreateUpdateCategory } from "./create-update-categories";
import { useTranslations } from "next-intl";
import { ConfirmDeletion } from "./confirm-deletion-categories";

export function TableCategoryView({
    categories,
  getCategories,
  deleteCategory,
  isLoading,
}: {
  categories: Categorias[];
  getCategories: () => Promise<void>;
  deleteCategory: (category: Categorias) => Promise<void>;
  isLoading: boolean;
}) {

    const t = useTranslations("TableCategory");
  return (
    <>
      {/* Contenedor principal con ScrollArea */}
      <ScrollArea className="h-[600px] rounded-md border shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-50 dark:bg-gray-800">
            <TableRow>
              {/* <TableHead className="w-[60px]"></TableHead> */}
              <TableHead className="w-[150px]">{t("headerName")}</TableHead>
                <TableHead className="w-[250px]">{t("headerDescription")}</TableHead>
                <TableHead className="w-[150px]">{t("headerQuantity")}</TableHead>
                <TableHead className="w-[120px] text-center">{t("headerActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading &&
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-sm">{category.nombre}</TableCell>
                  <TableCell className="font-medium text-sm">{category.descripcion}</TableCell>
                  <TableCell className="font-medium text-sm">{category.cantidad_servicios_asignados}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-center">
                      <CreateUpdateCategory
                        getCategories={getCategories}
                        categoryToUpdate={category}
                      >
                        <Button
                          variant="outline"
                          className="p-0.5 border-0 hover:bg-accent"
                        >
                          <SquarePen className="w-4 h-4" />
                        </Button>
                      </CreateUpdateCategory>
                      <ConfirmDeletion
                        deleteCategorie={deleteCategory}
                        categorie={category}
                      >
                        <Button
                          variant="outline"
                          className="p-0.5 border-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </ConfirmDeletion>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {isLoading &&
              [1, 2, 3].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {/* Skeleton circular para simular la imagen de perfil */}
                    <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell>
                    {/* Skeleton para el CPF/RG */}
                    <Skeleton className="w-[120px] h-5 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    {/* Skeleton para nombres y apellidos (más largo) */}
                    <Skeleton className="w-[200px] h-5 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    {/* Skeleton para botones de acción */}
                    <div className="flex space-x-2 justify-center">
                      <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
                      <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!isLoading && categories.length === 0 && (
          <div className="text-slate-300 my-20 p-8">
            <div className="flex justify-center">
              <LayoutList className="w-[120px] h-[120px]" />
            </div>
            <h2 className="text-center text-lg font-medium mt-4">No se encontraron registros existentes</h2>
          </div>
        )}
      </ScrollArea>
    </>
  );
}