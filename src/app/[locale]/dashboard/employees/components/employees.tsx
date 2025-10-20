"use client";
import React, { useState, useEffect } from 'react'
import { deleteDocument, getCollection } from '@/lib/firebase';
import { showToast } from 'nextjs-toast-notify';
import { Employees } from '../../../../../../interfaces/employees.interface';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CirclePlus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TableEmployeesView } from './table-view-employees';
import { CreateUpdateEmployees } from './create-update-employees';
import { orderBy, where } from 'firebase/firestore';

export default function EmployeesComponent() {

    const [employees, setEmployees] = useState<Employees[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employees[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Employees');

    useEffect(() => {
      getEmployee();
    }, []);

    useEffect(() => {
      filterEmployees();
    }, [searchTerm, employees]);

    const filterEmployees = () => {
      if (!searchTerm.trim()) {
        setFilteredEmployees(employees);
        return;
      }

      const filtered = employees.filter((employee) => {
        const search = searchTerm.toLowerCase();
        return (
          employee.nombre?.toLowerCase().includes(search) ||
          employee.apellido?.toLowerCase().includes(search) ||
          employee.cedula?.toLowerCase().includes(search) ||
          employee.correo?.toLowerCase().includes(search) ||
          employee.telefono?.toLowerCase().includes(search) ||
          employee.rol?.toLowerCase().includes(search)
        );
      });
      setFilteredEmployees(filtered);
    };

    const getEmployee = async () => {
        const path = `users`;
        const query = [where("rol", "==", "TRABAJADOR")]; // Array de queries
        setIsLoading(true);
        try {
          const res = (await getCollection(path, query)) as Employees[];
          setEmployees(res);
          setFilteredEmployees(res);
        } catch (error) {
          console.error(error);
          showToast.error("Error al cargar empleados", {
            duration: 2500,
            progress: true,
            position: "top-center",
            transition: "bounceIn",
            icon: '',
            sound: true,
          });
        } finally {
          setIsLoading(false);
        }
      };

      
  const deleteEmployee = async (employee: Employees) => {
    const path = `users/${employee.id}`;
    setIsLoading(true);
    try {
      await deleteDocument(path);
      showToast.success("Empleado eliminado exitosamente", {
        duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
      });
      getEmployee();
    } catch (error: any) {
      showToast.error(error.message, { 
        duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
       });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CreateUpdateEmployees getEmployeesAction={getEmployee}>
            <Button variant="outline" className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400">
              <CirclePlus className="mr-2 w-5" />
              {t('ButtonAdd')}
            </Button>
          </CreateUpdateEmployees>
        </div>

        {/* Buscador */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Contador de resultados */}
        {searchTerm && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? t('resultsFound') : t('resultsFoundPlural')}
          </p>
        )}

        <TableEmployeesView
          employees={filteredEmployees}
          getEmployee={getEmployee}
          deleteEmployee={deleteEmployee}
          isLoading={isLoading}
        />
    </div>
  )
}