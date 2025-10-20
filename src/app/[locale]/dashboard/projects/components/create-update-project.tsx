/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { addDocument, updateDocument, getCollection, setDocument, getDocument } from "@/lib/firebase";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "nextjs-toast-notify";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Project, ProjectService } from "../../../../../../interfaces/projects.interface";
import { Scheludes } from "../../../../../../interfaces/scheludes.interface";
import { Catalog, CatalogoProductosRequeridos } from "../../../../../../interfaces/calalog.interface";
import { LaborCost } from "../../../../../../interfaces/labor-cost.interface";
import { Client } from "../../../../../../interfaces/clients.interface";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "../../../../../../hooks/use-user";

interface CreateUpdateProjectProps {
  children: React.ReactNode;
  projectToUpdate?: Project;
  getProjects: () => Promise<void>;
}

export function CreateUpdateProject({
  children,
  projectToUpdate,
  getProjects,
}: CreateUpdateProjectProps) {
  const t = useTranslations('CreateUpdateProject');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<Scheludes[]>([]);
  const [services, setServices] = useState<Catalog[]>([]);
  const [laborCosts, setLaborCosts] = useState<LaborCost[]>([]);
  const [openAppointmentCombobox, setOpenAppointmentCombobox] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const [selectedAppointmentData, setSelectedAppointmentData] = useState<Scheludes | null>(null);
  const [projectServices, setProjectServices] = useState<ProjectService[]>([]);
  const [totalProyecto, setTotalProyecto] = useState<number>(0);

  const formSchema = z.object({
    id_cita: z.string().min(1, { message: t('validation.appointmentRequired') }),
    notas: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_cita: "",
      notas: "",
    },
  });

  const { user } = useUser();

  const { register, handleSubmit, setValue, formState: { errors } } = form;

  // Cargar citas con status POR VISITAR
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = (await getCollection('citas_agendadas')) as Scheludes[];
        const filtered = res.filter(apt => apt.status === 'POR VISITAR');
        setAppointments(filtered);
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  // Cargar servicios
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = (await getCollection('catalogos')) as Catalog[];
        setServices(res);
      } catch (error) {
        console.error('Error loading services:', error);
      }
    };
    fetchServices();
  }, []);

  // Cargar costos de mano de obra
  useEffect(() => {
    const fetchLaborCosts = async () => {
      try {
        const res = (await getCollection('costos_mano_obra')) as LaborCost[];
        setLaborCosts(res);
      } catch (error) {
        console.error('Error loading labor costs:', error);
      }
    };
    fetchLaborCosts();
  }, []);

  // Calcular totales cuando cambian los servicios
  useEffect(() => {
    const total = projectServices.reduce((sum, servicio) => sum + (servicio.total_servicio || 0), 0);
    setTotalProyecto(total);
  }, [projectServices]);

  useEffect(() => {
    if (projectToUpdate) {
      form.setValue("id_cita", projectToUpdate.id_cita || "");
      form.setValue("notas", projectToUpdate.notas || "");
      setSelectedAppointment(projectToUpdate.id_cita || "");
      setProjectServices(projectToUpdate.servicios || []);
    } else {
      form.reset();
      setSelectedAppointment("");
      setSelectedAppointmentData(null);
      setProjectServices([]);
    }
  }, [projectToUpdate, open, form]);

  const agregarServicio = () => {
    setProjectServices([...projectServices, {
      id_servicio: "",
      nombre_servicio: "",
      descripcion_servicio: "",
      precio_base: 0,
      descripcion_trabajo: "",
      usa_pie_lineal: false,
      usa_pie_cuadrado: false,
      pie_lineal: 0,
      pie_cuadrado: 0,
      costo_mano_obra: 0,
      costo_material_por_pie: 0,
      subtotal_servicio: 0,
      subtotal_materiales: 0,
      total_servicio: 0,
      nota_servicio: ""
    }]);
  };

  const eliminarServicio = (index: number) => {
    setProjectServices(projectServices.filter((_, i) => i !== index));
  };

  const recalcularTotales = (servicio: ProjectService) => {
    const medida = servicio.usa_pie_lineal ? (servicio.pie_lineal || 0) : 
                   servicio.usa_pie_cuadrado ? (servicio.pie_cuadrado || 0) : 0;
    
    // Calcular subtotal del servicio (precio base * medida)
    servicio.subtotal_servicio = servicio.precio_base * medida;
    
    // Calcular subtotal de materiales (costo_material_por_pie * medida)
    servicio.subtotal_materiales = (servicio.costo_material_por_pie || 0) * medida;
    
    // Calcular total del servicio (servicio + materiales + mano de obra * medida)
    servicio.total_servicio = servicio.subtotal_servicio + servicio.subtotal_materiales + ((servicio.costo_mano_obra || 0) * medida);
    
    return servicio;
  };

  const actualizarServicio = (index: number, field: keyof ProjectService, value: any) => {
    const nuevosServicios = [...projectServices];
    
    if (field === 'id_servicio') {
      const selectedService = services.find(s => s.id === value);
      console.log('Selected Service:', selectedService);
      
      if (selectedService) {
        // Buscar costo de mano de obra
        const laborCost = laborCosts.find(lc => lc.id_servicio === value);
        console.log('Labor Cost Found:', laborCost);
        
        const precioBase = Number(selectedService.precio) || 0;
        const costoManoObra = laborCost?.costo_mano_obra || 0;
        
        console.log('Precio Base:', precioBase);
        console.log('Costo Mano Obra:', costoManoObra);
        
        nuevosServicios[index] = {
          ...nuevosServicios[index],
          id_servicio: value as string,
          nombre_servicio: selectedService.nombre || "",
          descripcion_servicio: selectedService.descripcion || "",
          precio_base: precioBase,
          costo_mano_obra: costoManoObra
        };
        
        console.log('Updated Service:', nuevosServicios[index]);
      }
    } else {
      nuevosServicios[index] = { ...nuevosServicios[index], [field]: value };
    }
    
    // Recalcular totales usando la función auxiliar
    nuevosServicios[index] = recalcularTotales(nuevosServicios[index]);
    
    setProjectServices(nuevosServicios);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (projectServices.length === 0) {
      showToast.error(t('validation.servicesRequired'), {
        duration: 2500,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
      return;
    }

    const projectData = {
      ...data,
      servicios: projectServices,
      total_proyecto: totalProyecto
    };

    if (projectToUpdate) {
      UpdateProject(projectData);
    } else {
      CreateProject(projectData);
    }
  };

  // Función para guardar o actualizar cliente
  const saveOrUpdateClient = async (appointmentData: Scheludes): Promise<string> => {
    try {
      // Buscar si el cliente ya existe por email
      const clientsCollection = await getCollection('clientes');
      const existingClient = clientsCollection.find(
        (client: any) => client.email.toLowerCase() === appointmentData.email.toLowerCase()
      );

      const clientData: Client = {
        nombre: appointmentData.nombre,
        apellido: appointmentData.apellido,
        email: appointmentData.email.toLowerCase(),
        telefono: appointmentData.telefono,
        direccion: appointmentData.direccion,
        ciudad: appointmentData.ciudad,
        estado: appointmentData.estado,
        codigo_postal: appointmentData.codigo_postal,
      };

      if (existingClient) {
        // Actualizar cliente existente
        const clientPath = `clientes/${existingClient.id}`;
        await updateDocument(clientPath, {
          ...clientData,
          // total_proyectos: (existingClient) + 1,
          ultimo_proyecto: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        return existingClient.id;
      } else {
        // Crear nuevo cliente
        const newClientData = {
          ...clientData,
          total_proyectos: 1,
          ultimo_proyecto: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const docRef = await addDocument('clientes', newClientData);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving/updating client:', error);
      throw error;
    }
  };

  const CreateProject = async (projectData: any) => {
    const path = `proyectos`;
    setIsLoading(true);
    try {
      // Guardar o actualizar cliente
      let clientId = "";
      if (selectedAppointmentData) {
        clientId = await saveOrUpdateClient(selectedAppointmentData);
      }

      const normalizedProject = {
        ...projectData,
        status: "EN_PROCESO",
        cliente_id: clientId,
        cliente_nombre: selectedAppointmentData ? `${selectedAppointmentData.nombre} ${selectedAppointmentData.apellido}` : "",
        cliente_email: selectedAppointmentData?.email || "",
        cliente_telefono: selectedAppointmentData?.telefono || "",
        cliente_direccion: selectedAppointmentData ? `${selectedAppointmentData.direccion}, ${selectedAppointmentData.ciudad}, ${selectedAppointmentData.estado}, ${selectedAppointmentData.codigo_postal}` : "",
        fecha_inicio: new Date().toISOString(),
        created_at: new Date().toISOString(),
        trabajador_uid: user?.uid || "",
        trabajador_nombre: (user as any)?.nombre ? `${(user as any).nombre} ${(user as any).apellido || ''}`.trim() : (user as any)?.name || "",
      };

      await addDocument(path, normalizedProject);

      // Actualizar el estado de la cita a ATENDIDA
      if (selectedAppointmentData?.id) {
        const appointmentPath = `citas_agendadas/${selectedAppointmentData.id}`;
        await updateDocument(appointmentPath, { status: "ATENDIDA" });
      }
      showToast.success(t('successCreate'), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
      setOpen(false);
      form.reset();
      setSelectedAppointment("");
      setSelectedAppointmentData(null);
      setProjectServices([]);
      getProjects();
    } catch (error: any) {
      showToast.error(error.message, {
        duration: 2500,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const UpdateProject = async (projectData: any) => {
    const path = `proyectos/${projectToUpdate?.id}`;
    setIsLoading(true);
    try {
      const normalizedProject = {
        ...projectData,
        updated_at: new Date().toISOString(),
      };

      await updateDocument(path, normalizedProject);
      showToast.success(t('successUpdate'), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
      getProjects();
      setOpen(false);
      form.reset();
      setSelectedAppointment("");
      setSelectedAppointmentData(null);
      setProjectServices([]);
    } catch (error: any) {
      showToast.error(error.message, {
        duration: 2500,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {projectToUpdate ? t('titleUpdate') : t('titleCreate')}
            </DialogTitle>
            <DialogDescription>
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Seleccionar Cliente (Cita) */}
            <div className="space-y-2">
              <Label htmlFor="id_cita">{t('appointment')}</Label>
              <Popover open={openAppointmentCombobox} onOpenChange={setOpenAppointmentCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openAppointmentCombobox}
                    className="w-full justify-between"
                    disabled={!!projectToUpdate}
                  >
                    {selectedAppointment
                      ? (() => {
                          const apt = appointments.find((a) => a.id === selectedAppointment);
                          return apt ? `${apt.nombre} ${apt.apellido} - ${apt.email}` : t('appointmentPlaceholder');
                        })()
                      : t('appointmentPlaceholder')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t('appointmentSearch')} className="h-9" />
                    <CommandList>
                      <CommandEmpty>{t('appointmentNotFound')}</CommandEmpty>
                      <CommandGroup>
                        {appointments.map((appointment) => (
                          <CommandItem
                            key={appointment.id}
                            value={`${appointment.nombre} ${appointment.apellido} ${appointment.email}`}
                            onSelect={() => {
                              const newValue = appointment.id === selectedAppointment ? "" : appointment.id || "";
                              setSelectedAppointment(newValue);
                              setSelectedAppointmentData(appointment);
                              setValue("id_cita", newValue);
                              setOpenAppointmentCombobox(false);
                            }}
                          >
                            {appointment.nombre} {appointment.apellido} - {appointment.email}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedAppointment === appointment.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.id_cita && (
                <p className="text-sm text-red-500">{errors.id_cita.message}</p>
              )}
            </div>

            {/* Mostrar Dirección del Cliente */}
            {selectedAppointmentData && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">{t('clientAddress')}</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedAppointmentData.direccion}
                    {selectedAppointmentData.direccion2 && `, ${selectedAppointmentData.direccion2}`}
                    <br />
                    {selectedAppointmentData.ciudad}, {selectedAppointmentData.estado} {selectedAppointmentData.codigo_postal}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <span className="font-medium text-blue-900 dark:text-blue-100">{t('clientPhone')}:</span>
                      <span className="ml-2 text-blue-800 dark:text-blue-200">{selectedAppointmentData.telefono}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900 dark:text-blue-100">{t('clientEmail')}:</span>
                      <span className="ml-2 text-blue-800 dark:text-blue-200">{selectedAppointmentData.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estado del Proyecto - Automáticamente EN_PROCESO */}

            {/* Servicios del Proyecto */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{t('services')}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarServicio}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('addService')}
                </Button>
              </div>

              {projectServices.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 rounded-lg border-2 border-dashed dark:border-gray-600">
                  <p>{t('noServices')}</p>
                  <p className="text-sm">{t('noServicesHint')}</p>
                </div>
              )}

              {projectServices.map((service, index) => {
                return (
                  <Card key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">{t('service')} {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarServicio(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Combobox para Seleccionar Servicio */}
                      <div className="space-y-1">
                        <Label>{t('serviceName')}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {service.id_servicio
                                ? services.find((s) => s.id === service.id_servicio)?.nombre
                                : t('serviceNamePlaceholder')}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder={t('serviceSearch')} className="h-9" />
                              <CommandList>
                                <CommandEmpty>{t('serviceNotFound')}</CommandEmpty>
                                <CommandGroup>
                                  {services.map((s) => (
                                    <CommandItem
                                      key={s.id}
                                      value={s.nombre}
                                      onSelect={() => {
                                        actualizarServicio(index, 'id_servicio', s.id || "");
                                      }}
                                    >
                                      {s.nombre}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          service.id_servicio === s.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Mostrar Precio Base y Descripción del Servicio */}
                      {service.id_servicio && (
                        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t('basePrice')}:</span>
                                <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                                  ${service.precio_base?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t('laborCost')}:</span>
                                <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
                                  ${service.costo_mano_obra?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">{t('serviceDescription')}:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {service.descripcion_servicio}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Descripción del Trabajo */}
                      <div className="space-y-1">
                        <Label>{t('workDescription')}</Label>
                        <Input
                          value={service.descripcion_trabajo || ''}
                          onChange={(e) => actualizarServicio(index, 'descripcion_trabajo', e.target.value)}
                          placeholder={t('workDescriptionPlaceholder')}
                        />
                      </div>

                      {/* Checkboxes para Tipo de Medida */}
                      <div className="space-y-2">
                        <Label>{t('measurementType')}</Label>
                        <div className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`lineal-${index}`}
                              checked={service.usa_pie_lineal === true}
                              onCheckedChange={() => {
                                const nuevosServicios = [...projectServices];
                                nuevosServicios[index] = {
                                  ...nuevosServicios[index],
                                  usa_pie_lineal: !service.usa_pie_lineal,
                                  usa_pie_cuadrado: false,
                                  pie_cuadrado: 0
                                };
                                // Recalcular totales
                                nuevosServicios[index] = recalcularTotales(nuevosServicios[index]);
                                setProjectServices(nuevosServicios);
                              }}
                            />
                            <label
                              htmlFor={`lineal-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {t('linearFeet')}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`cuadrado-${index}`}
                              checked={service.usa_pie_cuadrado === true}
                              onCheckedChange={() => {
                                const nuevosServicios = [...projectServices];
                                nuevosServicios[index] = {
                                  ...nuevosServicios[index],
                                  usa_pie_cuadrado: !service.usa_pie_cuadrado,
                                  usa_pie_lineal: false,
                                  pie_lineal: 0
                                };
                                // Recalcular totales
                                nuevosServicios[index] = recalcularTotales(nuevosServicios[index]);
                                setProjectServices(nuevosServicios);
                              }}
                            />
                            <label
                              htmlFor={`cuadrado-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {t('squareFeet')}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Input de Medidas */}
                      {service.usa_pie_lineal && (
                        <div className="space-y-1">
                          <Label>{t('linearFeet')}</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={service.pie_lineal || ''}
                            onChange={(e) => actualizarServicio(index, 'pie_lineal', parseFloat(e.target.value) || 0)}
                            placeholder={t('linearFeetPlaceholder')}
                          />
                        </div>
                      )}

                      {service.usa_pie_cuadrado && (
                        <div className="space-y-1">
                          <Label>{t('squareFeet')}</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={service.pie_cuadrado || ''}
                            onChange={(e) => actualizarServicio(index, 'pie_cuadrado', parseFloat(e.target.value) || 0)}
                            placeholder={t('squareFeetPlaceholder')}
                          />
                        </div>
                      )}

                      {/* Costo de Material por Pie */}
                      {(service.usa_pie_lineal || service.usa_pie_cuadrado) && (
                        <div className="space-y-1">
                          <Label>{t('materialCostPerFoot')}</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={service.costo_material_por_pie || ''}
                            onChange={(e) => actualizarServicio(index, 'costo_material_por_pie', parseFloat(e.target.value) || 0)}
                            placeholder={t('materialCostPerFootPlaceholder')}
                          />
                        </div>
                      )}

                      {/* Nota del Servicio */}
                      <div className="space-y-1">
                        <Label>{t('serviceNote')}</Label>
                        <Textarea
                          value={service.nota_servicio || ''}
                          onChange={(e) => actualizarServicio(index, 'nota_servicio', e.target.value)}
                          placeholder={t('serviceNotePlaceholder')}
                          rows={2}
                        />
                      </div>

                      {/* Totales del Servicio */}
                      {service.id_servicio && (service.usa_pie_lineal || service.usa_pie_cuadrado) && (
                        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
                          <CardContent className="pt-4">
                            <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('serviceTotals')}</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">{t('serviceSubtotal')}:</span>
                                <span className="ml-2 font-medium">${service.subtotal_servicio?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">{t('materialsSubtotal')}:</span>
                                <span className="ml-2 font-medium">${service.subtotal_materiales?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">{t('laborCostTotal')}:</span>
                                <span className="ml-2 font-medium">
                                  ${((service.costo_mano_obra || 0) * (service.usa_pie_lineal ? (service.pie_lineal || 0) : (service.pie_cuadrado || 0))).toFixed(2)}
                                </span>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                                <span className="text-gray-800 dark:text-gray-200 font-semibold">{t('serviceTotal')}:</span>
                                <span className="ml-2 font-bold text-green-600 dark:text-green-400 text-lg">
                                  ${service.total_servicio?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Total del Proyecto */}
            {projectServices.length > 0 && (
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-300 dark:border-orange-700 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('projectTotal')}:</h3>
                    <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      ${totalProyecto.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">{t('notes')}</Label>
              <Textarea
                {...register("notas")}
                id="notas"
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-400">
              {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {projectToUpdate ? t('buttonUpdate') : t('buttonCreate')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
