/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteDocument, getCollection } from "@/lib/firebase";
import { orderBy, where } from "firebase/firestore";
import { Eye, Mail } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { useEffect, useState } from "react";
import { Scheludes } from "../../../../../../interfaces/scheludes.interface";
import { useUser } from "../../../../../../hooks/use-user";
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AppointmentDetailsDialog from "./appointment-details-dialog";


export default function PendingAppointments(){
    
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Scheludes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"cedula" | "nombres">("cedula");
  const [selectedAppointment, setSelectedAppointment] = useState<Scheludes | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);

  const getAppointments = async () => {
    setIsLoading(true);
    console.log("Starting to load appointments.");
    
    try {
      const path = `citas_agendadas`;
      
      // Primero intentamos sin filtros para ver si hay datos
      console.log("Fetching from path:", path);
      const res = (await getCollection(path, [])) as Scheludes[];
      
      console.log("Raw data from Firebase:", res);
      console.log("Number of appointments:", res.length);
      
      // Filtrar solo las pendientes en el cliente
      const pendingAppointments = res.filter(appointment => 
        appointment.status === "PENDIENTE"
      );
      
      console.log("Pending appointments:", pendingAppointments);
      setAppointments(pendingAppointments);
      
    } catch (error) {
      console.error("Error loading appointments:", error);
      showToast.error("Error al cargar las citas: " + (error as Error).message, {
        duration: 3000,
        position: "top-center",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
    } finally {
      setIsLoading(false);
      console.log("Loading finished");
    }
  };

  useEffect(() => {
    if (user) getAppointments();
  }, [user]);

  const handleViewDetails = (appointment: Scheludes) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleSendEmail = async (appointment: Scheludes) => {
    if (!appointment.id) return;
    
    setIsSendingEmail(appointment.id);
    
    try {
      const response = await fetch('/api/send-appointment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: appointment.email,
          nombre: appointment.nombre,
          apellido: appointment.apellido,
          fecha: appointment.fecha instanceof Date 
            ? appointment.fecha.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : appointment.fecha,
          hora: appointment.hora,
          direccion: appointment.direccion,
          ciudad: appointment.ciudad,
          estado: appointment.estado,
          telefono: appointment.telefono,
          notas: appointment.notas,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el email');
      }

      showToast.success('Email enviado exitosamente a ' + appointment.email, {
        duration: 3000,
        position: "top-center",
        transition: "bounceIn",
        icon: '✉️',
        sound: true,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      showToast.error('Error al enviar el email: ' + (error as Error).message, {
        duration: 3000,
        position: "top-center",
        transition: "bounceIn",
        icon: '❌',
        sound: true,
      });
    } finally {
      setIsSendingEmail(null);
    }
  };


  return (
    <>
    <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Lista de Citas
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona todas las citas pendientes
            </CardDescription>
          </div>
         
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-50 dark:bg-gray-800">
            <TableRow>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="w-[200px]">Cliente</TableHead>
              <TableHead className="w-[150px]">Email</TableHead>
              <TableHead className="w-[150px]">Teléfono</TableHead>
              <TableHead className="w-[150px]">Fecha</TableHead>
              <TableHead className="w-[100px]">Hora</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead className="w-[120px] text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading &&
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="py-3">
                    <div className="mx-auto h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 font-semibold">
                      {appointment.nombre.charAt(0)}{appointment.apellido.charAt(0)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm text-gray-900 dark:text-gray-100 align-middle">
                    {appointment.nombre + " " + appointment.apellido}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-gray-700 dark:text-gray-300 align-middle">
                    {appointment.email}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-gray-700 dark:text-gray-300 align-middle">
                    {appointment.telefono}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-gray-700 dark:text-gray-300 align-middle">
                    {appointment.fecha instanceof Date ? appointment.fecha.toLocaleDateString() : appointment.fecha}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-gray-700 dark:text-gray-300 align-middle">
                    {appointment.hora}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      {appointment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(appointment)}
                        className="p-1 border-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(appointment)}
                        disabled={isSendingEmail === appointment.id}
                        className="p-1 border-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:text-green-400 disabled:opacity-50"
                        title="Enviar email"
                      >
                        {isSendingEmail === appointment.id ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay citas pendientes
                </TableCell>
              </TableRow>
            )}
            {isLoading &&
              [1, 2, 3, 4, 5].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-[180px] h-5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-[120px] h-5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-[80px] h-5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-[80px] h-6 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-center">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    <CardFooter></CardFooter>
    </Card>
    
    <AppointmentDetailsDialog
      appointment={selectedAppointment}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    />
    </>
  );
};
