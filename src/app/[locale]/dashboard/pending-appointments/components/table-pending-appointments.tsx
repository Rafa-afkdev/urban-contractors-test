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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setDocument } from "@/lib/firebase";
import { SendEmail } from "@/lib/resend";
import { generateAppointmentEmailHTML } from "@/lib/email-templates/appointment-confirmation";
import { useParams } from "next/navigation";
import { Eye, Mail, CheckCheck, LoaderCircle } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { useState } from "react";
import { Scheludes } from "../../../../../../interfaces/scheludes.interface";
import { useUser } from "../../../../../../hooks/use-user";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";


export default function PendingAppointments({  
  appointments,
  getAppointmentsAction,
  isLoading,
}: {
  appointments: Scheludes[];
  getAppointmentsAction: () => void;
  isLoading: boolean;
}) {
    const t = useTranslations('PendingAppointments');
  const { user } = useUser();
  const params = useParams();
  const locale = params.locale as string || 'en';

  // Función para traducir el status
  const getTranslatedStatus = (status: string) => {
    try {
      return t(`Status.${status}`);
    } catch (error) {
      // Si no existe la traducción, devolver el status original
      return status;
    }
  };

  // Función para obtener los colores del badge según el status
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'EN_PROCESO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  const [selectedAppointment, setSelectedAppointment] = useState<Scheludes | null>(null);
  const [selectedAppointmentEmail, setSelectedAppointmentEmail] = useState<Scheludes | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [openConfirmEmailDialog, setOpenConfirmEmailDialog] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState<string>('');

  const handleViewDetails = (appointment: Scheludes) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleConfirmSendEmail = async () => {
    if (!selectedAppointmentEmail || !selectedAppointmentEmail.id) return;
    
    setIsSendingEmail(true);
    
    try {
      // Generar email con el nuevo template bilingüe y mensaje adicional
      const { subject, html } = generateAppointmentEmailHTML(
        selectedAppointmentEmail, 
        locale, 
        additionalMessage.trim() || undefined
      );

      // Enviar email al cliente real usando Resend
      await SendEmail(
        selectedAppointmentEmail.email, // Email real del cliente
        subject,
        html
      );

      // Actualizar estado de la cita a "POR VISITAR"
      await setDocument(
        `citas_agendadas/${selectedAppointmentEmail.id}`,
        { ...selectedAppointmentEmail, status: "POR VISITAR" }
      );

      showToast.success('Email enviado exitosamente y cita actualizada', {
        duration: 3000,
        position: "top-center",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });

      setOpenConfirmEmailDialog(false);
      setAdditionalMessage(''); // Limpiar mensaje adicional
      getAppointmentsAction();
    } catch (error) {
      console.error('Error sending email:', error);
      showToast.error('Error al enviar el email: ' + (error as Error).message, {
        duration: 3000,
        position: "top-center",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
    <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('title')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isLoading 
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    : appointments.length === 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : appointments.length <= 3
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : appointments.length <= 7
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                      <span>...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        appointments.length === 0
                          ? 'bg-green-500'
                          : appointments.length <= 3
                          ? 'bg-blue-500'
                          : appointments.length <= 7
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}></div>
                      <span>
                        {appointments.length === 1 
                          ? t('appointmentCountSingle', { count: appointments.length })
                          : t('appointmentCount', { count: appointments.length })
                        }
                      </span>
                    </div>
                  )}
                </span>
              </div>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              {t('description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-50 dark:bg-gray-800">
            <TableRow>
            <TableHead className="w-[120px]"></TableHead>
              <TableHead className="w-[60px]">{t('Table.client')}</TableHead>
              <TableHead className="w-[200px]">{t('Table.email')}</TableHead>
              <TableHead className="w-[150px]">{t('Table.phone')}</TableHead>
              <TableHead className="w-[150px]">{t('Table.date')}</TableHead>
              <TableHead className="w-[150px]">{t('Table.time')}</TableHead>
              <TableHead className="w-[120px]">{t('Table.status')}</TableHead>
              <TableHead className="w-[120px]">{t('Table.actions')}</TableHead>
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColors(appointment.status)}`}>
                      {getTranslatedStatus(appointment.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 ">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(appointment)}
                        className="p-1 border-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        title={t('Tooltips.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointmentEmail(appointment);
                          setOpenConfirmEmailDialog(true);
                        }}
                        className="p-1 border-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:text-green-400"
                        title={t('Tooltips.sendEmail')}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('Table.TableInfo')}
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
                    <Skeleton className="w-[100px] h-5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-[100px] h-5" />
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

    {/* Diálogo de Confirmación para Enviar Email */}
    <Dialog open={openConfirmEmailDialog} onOpenChange={setOpenConfirmEmailDialog}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 shadow-2xl overflow-hidden">
        <DialogHeader className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 dark:from-orange-700 dark:via-orange-600 dark:to-orange-500 -mx-6 -mt-6 px-8 py-6 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-orange-400/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {t('EmailDialog.title')}
              </DialogTitle>
            </div>
            <DialogDescription className="text-orange-100 text-sm leading-relaxed">
              {t('EmailDialog.description')}
            </DialogDescription>
          </div>
        </DialogHeader>

        {selectedAppointmentEmail && (
          <div className="px-2 py-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-600/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-300 font-semibold text-lg">
                  {selectedAppointmentEmail.nombre.charAt(0)}{selectedAppointmentEmail.apellido.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedAppointmentEmail.nombre} {selectedAppointmentEmail.apellido}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedAppointmentEmail.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('EmailDialog.date')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedAppointmentEmail.fecha instanceof Date 
                      ? selectedAppointmentEmail.fecha.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')
                      : selectedAppointmentEmail.fecha}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('EmailDialog.time')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{selectedAppointmentEmail.hora}</span>
                </div>
              </div>
            </div>

            {/* Campo de descripción adicional */}
            <div className="space-y-3 mb-4">
              <Label htmlFor="additional-message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('EmailDialog.additionalMessage')}
              </Label>
              <Textarea
                id="additional-message"
                placeholder={t('EmailDialog.placeholder')}
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                className="min-h-[80px] resize-none border-orange-200 dark:border-orange-600 focus:border-orange-400 focus:ring-orange-200 dark:bg-gray-800 dark:text-gray-100"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {additionalMessage.length}/500 {t('EmailDialog.characters')}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600/30 rounded-lg p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>{t('EmailDialog.important')}</strong> {t('EmailDialog.importantText')}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-700/50 -mx-6 -mb-6 px-8 py-6 mt-6">
          <div className="relative z-10 flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenConfirmEmailDialog(false)}
              disabled={isSendingEmail}
              className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100 px-6 py-2 transition-all duration-200"
            >
              {t('EmailDialog.cancel')}
            </Button>

            <Button
              type="button"
              onClick={handleConfirmSendEmail}
              disabled={isSendingEmail}
              className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0 px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
            >
              {isSendingEmail ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  {t('EmailDialog.sending')}
                </>
              ) : (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  {t('EmailDialog.sendEmail')}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      </Dialog>

    {/* Diálogo de Detalles del Cliente */}
    <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[700px] bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 shadow-2xl">
        <DialogHeader className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 dark:from-orange-700 dark:via-orange-600 dark:to-orange-500 -mx-6 -mt-6 px-8 py-6 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-orange-400/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {t('DetailsDialog.title')}
              </DialogTitle>
            </div>
            <DialogDescription className="text-orange-100 text-sm leading-relaxed">
              {t('DetailsDialog.description')}
            </DialogDescription>
          </div>
        </DialogHeader>

        {selectedAppointment && (
          <div className="px-2 py-4 space-y-6 max-h-[500px] overflow-y-auto">
            {/* Información Personal */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mr-3">
                  👤
                </div>
                {t('DetailsDialog.personalInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.fullName')}</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedAppointment.nombre} {selectedAppointment.apellido}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.email')}</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedAppointment.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.phone')}</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedAppointment.telefono}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.status')}</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColors(selectedAppointment.status)}`}>
                    {getTranslatedStatus(selectedAppointment.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de la Cita */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mr-3">
                  📅
                </div>
                {t('DetailsDialog.appointmentDetails')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.date')}</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {selectedAppointment.fecha instanceof Date 
                      ? selectedAppointment.fecha.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { 
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                        })
                      : selectedAppointment.fecha}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.time')}</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedAppointment.hora}</p>
                </div>
              </div>
            </div>

            {/* Información de Ubicación */}
            {(selectedAppointment.direccion || selectedAppointment.ciudad || selectedAppointment.estado) && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-600/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mr-3">
                    📍
                  </div>
                  {t('DetailsDialog.location')}
                </h3>
                <div className="space-y-3">
                  {selectedAppointment.direccion && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.address')}</label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedAppointment.direccion}</p>
                    </div>
                  )}
                  {selectedAppointment.direccion2 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.address2')}</label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedAppointment.direccion2}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAppointment.ciudad && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.city')}</label>
                        <p className="text-gray-900 dark:text-gray-100">{selectedAppointment.ciudad}</p>
                      </div>
                    )}
                    {selectedAppointment.estado && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.state')}</label>
                        <p className="text-gray-900 dark:text-gray-100">{selectedAppointment.estado}</p>
                      </div>
                    )}
                    {selectedAppointment.codigo_postal && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('DetailsDialog.postalCode')}</label>
                        <p className="text-gray-900 dark:text-gray-100">{selectedAppointment.codigo_postal}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {selectedAppointment.notas && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-600/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mr-3">
                    📝
                  </div>
                  {t('DetailsDialog.additionalNotes')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">{selectedAppointment.notas}</p>
              </div>
            )}
          </div>
        )}

        {/* <DialogFooter className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-orange-50/50 -mx-6 -mb-6 px-8 py-6 mt-6">
          <div className="relative z-10 flex justify-end w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
              className="border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-800 px-6 py-2 transition-all duration-200"
            >
              Cerrar
            </Button>
          </div>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
    </>
  );
}