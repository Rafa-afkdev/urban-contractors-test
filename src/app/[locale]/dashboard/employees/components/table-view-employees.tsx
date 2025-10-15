/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LayoutList, SquarePen, Trash2, Eye } from "lucide-react";
import { Employees } from "../../../../../../interfaces/employees.interface";
import { ConfirmDeletionEmployee } from "./confirm-deletion";
import { useTranslations } from "next-intl";
import { CreateUpdateEmployees } from "./create-update-employees";
import { ViewEmployeeDetails } from "./view-employee-details";

export function TableEmployeesView({
  employees,
  getEmployee,
  deleteEmployee,
  isLoading,
}: {
  employees: Employees[];
  getEmployee: () => Promise<void>;
  deleteEmployee: (employee: Employees) => Promise<void>;
  isLoading: boolean;
}) {
    const t = useTranslations('Employees');
    
  return (
    <>
      {/* Contenedor principal con ScrollArea */}
      <ScrollArea className="h-[600px] rounded-md border shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-50 dark:bg-gray-800">
            <TableRow>
              <TableHead className="w-[60px]">{t('tableHeaders.photo')}</TableHead>
              <TableHead className="w-[150px]">{t('tableHeaders.socialSecurity')}</TableHead>
                <TableHead className="w-[250px]">{t('tableHeaders.fullName')}</TableHead>
                <TableHead className="w-[120px] text-center">{t('tableHeaders.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading &&
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="py-3">
                    {employee.imagen ? (
                      <img
                        src={employee.imagen}
                        alt={`Foto de ${employee.nombre}`}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                    <div className="mx-auto h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 font-semibold">
                        {employee.nombre?.charAt(0)}{employee.apellido?.charAt(0)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{employee.cedula}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {employee.nombre + " " + employee.apellido}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-center">
                      <CreateUpdateEmployees
                        getEmployeesAction={getEmployee}
                        employeeToUpdate={employee}
                      >
                        <Button
                          variant="outline"
                          className="p-0.5 border-0 hover:bg-accent"
                          title={t('tooltips.edit')}
                        >
                          <SquarePen className="w-4 h-4" />
                        </Button>
                      </CreateUpdateEmployees>
                      <ViewEmployeeDetails employee={employee}>
                        <Button
                          variant="outline"
                          className="p-0.5 border-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                          title={t('tooltips.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </ViewEmployeeDetails>
                      <ConfirmDeletionEmployee
                        deleteEmployee={deleteEmployee}
                        employee={employee}
                      >
                        <Button
                          variant="outline"
                          className="p-0.5 border-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                          title={t('tooltips.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </ConfirmDeletionEmployee>
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
                      <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!isLoading && employees.length === 0 && (
          <div className="text-slate-300 my-20 p-8">
            <div className="flex justify-center">
              <LayoutList className="w-[120px] h-[120px]" />
            </div>
            <h2 className="text-center text-lg font-medium mt-4">{t('NoRegistors')}</h2>
          </div>
        )}
      </ScrollArea>
    </>
  );
}