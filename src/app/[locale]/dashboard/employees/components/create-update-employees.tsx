/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, LoaderCircle, UserCheck, MapPin, Lock, Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  addDocument,
  getCollection,
  updateDocument,
  createUser,
  setDocument,
  uploadBase64,
} from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employees } from "../../../../../../interfaces/employees.interface";
import { useTranslations } from "next-intl";
import { showToast } from "nextjs-toast-notify";
import DragAndDropImageUser from "@/components/ui/drag-and-drog-image-user";

interface CreateUpdateEmployeesProps {
  children: React.ReactNode;
  employeeToUpdate?: Employees;
  getEmployeesAction: () => Promise<void>
}

export function CreateUpdateEmployees({
  children,
  employeeToUpdate,
  getEmployeesAction
}: CreateUpdateEmployeesProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const t = useTranslations('CreateUpdateEmployees');
  const [image, setImage] = useState<string>("");

  const formSchema = z.object({
    imagen: z.string().optional(),
    cedula: z.string().min(1, t("validation.cedulaRequired")),
    nombre: z.string().min(1, t("validation.nombresRequired")),
    apellido: z.string().min(1, t("validation.apellidosRequired")),
    correo: z.string().email(t("validation.correoRequired")),
    contraseña: employeeToUpdate 
      ? z.string().optional()
      : z.string().min(6, t("validation.contraseñaRequired")),
    telefono: z.string().min(1, t("validation.telefonoRequired")),
    direccion: z.string().min(1, t("validation.direccionRequired")),
    ciudad: z.string().min(1, t("validation.ciudadRequired")),
    estado: z.string().min(1, t("validation.estadoRequired")),
    codigo_postal: z.string().min(1, t("validation.codigoPostalRequired")),
    rol: z.string().min(1, t("validation.rolRequired")),
    status: z.string().min(1, t("validation.statusRequired")),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: employeeToUpdate
      ? {
          imagen: (employeeToUpdate.imagen as any)?.url || "",
          cedula: employeeToUpdate.cedula || "",
          nombre: employeeToUpdate.nombre || "",
          apellido: employeeToUpdate.apellido || "",
          correo: employeeToUpdate.correo || "",
          contraseña: "",
          telefono: employeeToUpdate.telefono || "",
          direccion: employeeToUpdate.direccion || "",
          ciudad: employeeToUpdate.ciudad || "",
          estado: employeeToUpdate.estado || "",
          codigo_postal: employeeToUpdate.codigo_postal || "",
          rol: employeeToUpdate.rol || "TRABAJADOR",
          status: employeeToUpdate.status || "ACTIVO",
        }
      : {
          imagen: "",
          cedula: "",
          nombre: "",
          apellido: "",
          correo: "",
          contraseña: "",
          telefono: "",
          direccion: "",
          ciudad: "",
          estado: "",
          codigo_postal: "",
          rol: "TRABAJADOR",
          status: "ACTIVO",
        },
  });

  const { register, handleSubmit, formState, setValue } = form;
  const { errors } = formState;

  useEffect(() => {
    if (employeeToUpdate && employeeToUpdate.imagen) {
      setImage((employeeToUpdate.imagen as any)?.url || "");
    } else {
      setImage("");
    }
  }, [employeeToUpdate, open]);

  const onSubmit = async (employee: z.infer<typeof formSchema>) => {
    if (employeeToUpdate) {
      updateEmployee(employee);
    } else {
      createEmployee(employee);
    }
  };

  const checkDuplicateCedula = async (
    cedula: number,
    currentEmployeeId?: string
  ): Promise<boolean> => {
    try {
      const employees = await getCollection("users");
      return employees.some(
        (employee: any) =>
          Number(employee.cedula) === cedula && employee.id !== currentEmployeeId
      );
    } catch (error) {
      console.error("Error checking duplicate cedula:", error);
      return false;
    }
  };

  const handleImage = (url: string) => {
    setValue("imagen", url);
    setImage(url);
  };

  const createEmployee = async (employee: any) => {
    setIsLoading(true);
    try {
      const isDuplicate = await checkDuplicateCedula(Number(employee.cedula));
      if (isDuplicate) {
        showToast.error("Ya existe un empleado con esta cédula", {
          duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
        });
        setIsLoading(false);
        return;
      }

      const userCredential = await createUser({
        email: employee.correo,
        password: employee.contraseña,
      });

      const uid = userCredential.user.uid;

      // Subir imagen si es base64
      let photoUrl = image || "";
      if (photoUrl && photoUrl.startsWith("data:")) {
        const storagePath = `users/${uid}`;
        photoUrl = await uploadBase64(storagePath, photoUrl);
      }

      const normalizedEmployee = {
        imagen: photoUrl,
        cedula: employee.cedula,
        nombre: employee.nombre?.toUpperCase(),
        apellido: employee.apellido?.toUpperCase(),
        correo: employee.correo?.toLowerCase(),
        telefono: employee.telefono,
        direccion: employee.direccion?.toUpperCase(),
        ciudad: employee.ciudad?.toUpperCase(),
        estado: employee.estado?.toUpperCase(),
        codigo_postal: employee.codigo_postal,
        uid: uid,
        rol: employee.rol,
        status: employee.status,
        created_at: new Date(),
      };
      
      // Usar setDocument con el UID como ID del documento
      await setDocument(`users/${uid}`, normalizedEmployee);
      
      showToast.success(t('successCreate'), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
      getEmployeesAction();
      setOpen(false);
      form.reset();
      setImage("");
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "El correo electrónico ya está en uso";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El correo electrónico no es válido";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil";
      }

      showToast.error(errorMessage, {
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

  const updateEmployee = async (employee: any) => {
    const path = `users/${employeeToUpdate?.id}`;
    setIsLoading(true);
    try {
      const isDuplicate = await checkDuplicateCedula(
        Number(employee.cedula),
        employeeToUpdate?.id
      );
      if (isDuplicate) {
        showToast.error("Ya existe un empleado con esta cédula", {
          duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
        });
        setIsLoading(false);
        return;
      }

      // Subir imagen si es base64
      let photoUrl = image || (employeeToUpdate?.imagen as any)?.url || "";
      if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith("data:")) {
        const storagePath = `users/${employeeToUpdate?.id}`;
        photoUrl = await uploadBase64(storagePath, photoUrl);
      }

      const normalizedEmployee = {
        imagen: photoUrl,
        cedula: employee.cedula,
        nombre: employee.nombre?.toUpperCase(),
        apellido: employee.apellido?.toUpperCase(),
        correo: employee.correo?.toLowerCase(),
        telefono: employee.telefono,
        direccion: employee.direccion?.toUpperCase(),
        ciudad: employee.ciudad?.toUpperCase(),
        estado: employee.estado?.toUpperCase(),
        codigo_postal: employee.codigo_postal,
        rol: employee.rol,
        status: employee.status,
        updated_at: new Date(),
      };
      await updateDocument(path, normalizedEmployee);
      showToast.success(t('successUpdate'), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
      await getEmployeesAction();
      setOpen(false);
      form.reset();
      setImage("");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-xl font-bold dark:text-gray-100">
            {employeeToUpdate ? t('titleUpdate') : t('titleCreate')}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-6 py-4">
              {/* Imagen de Perfil */}
              <div className="flex justify-center">
                <div className="space-y-2 text-center">
                  <Label htmlFor="image" className="flex items-center justify-center gap-2 text-base font-semibold dark:text-gray-200">
                    <ImageIcon className="w-5 h-5" />
                    {t('image')}
                  </Label>
                  <DragAndDropImageUser 
                    handleImage={handleImage} 
                    initialImage={image} 
                  />
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Sección: Información Personal */}
              <div className="space-y-4">
                {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-sky-500" />
                  Información Personal
                </h3> */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Cédula */}
                  <div className="space-y-1">
                    <Label htmlFor="cedula">{t('cedula')}</Label>
                    <Input
                      {...register("cedula")}
                      id="cedula"
                      placeholder={t('cedulaPlaceholder')}
                    />
                    {errors.cedula && (
                      <p className="text-red-500 text-sm">{errors.cedula.message}</p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="space-y-1">
                    <Label htmlFor="nombre">{t('nombres')}</Label>
                    <Input
                      {...register("nombre")}
                      id="nombre"
                      placeholder={t('nombresPlaceholder')}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-sm">{errors.nombre.message}</p>
                    )}
                  </div>

                  {/* Apellido */}
                  <div className="space-y-1">
                    <Label htmlFor="apellido">{t('apellidos')}</Label>
                    <Input
                      {...register("apellido")}
                      id="apellido"
                      placeholder={t('apellidosPlaceholder')}
                    />
                    {errors.apellido && (
                      <p className="text-red-500 text-sm">{errors.apellido.message}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1">
                    <Label htmlFor="telefono">{t('telefono')}</Label>
                    <Input
                      {...register("telefono")}
                      id="telefono"
                      placeholder={t('telefonoPlaceholder')}
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-sm">{errors.telefono.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Sección: Datos de Acceso */}
              <div className="space-y-4">
                {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-sky-500" />
                  Datos de Acceso
                </h3> */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Correo */}
                  <div className="space-y-1">
                    <Label htmlFor="correo">{t('correo')}</Label>
                    <Input
                      {...register("correo")}
                      id="correo"
                      type="email"
                      placeholder={t('correoPlaceholder')}
                      disabled={!!employeeToUpdate}
                    />
                    {errors.correo && (
                      <p className="text-red-500 text-sm">{errors.correo.message}</p>
                    )}
                  </div>

                  {/* Contraseña (solo al crear) */}
                  {!employeeToUpdate && (
                    <div className="space-y-1">
                      <Label htmlFor="contraseña">{t('contraseña')}</Label>
                      <Input
                        {...register("contraseña")}
                        id="contraseña"
                        type="password"
                        placeholder={t('contraseñaPlaceholder')}
                      />
                      {errors.contraseña && (
                        <p className="text-red-500 text-sm">{errors.contraseña.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Sección: Dirección */}
              <div className="space-y-4">
                {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  Dirección
                </h3> */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Dirección */}
                  <div className="space-y-1 lg:col-span-2">
                    <Label htmlFor="direccion">{t('direccion')}</Label>
                    <Input
                      {...register("direccion")}
                      id="direccion"
                      placeholder={t('direccionPlaceholder')}
                    />
                    {errors.direccion && (
                      <p className="text-red-500 text-sm">{errors.direccion.message}</p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div className="space-y-1">
                    <Label htmlFor="ciudad">{t('ciudad')}</Label>
                    <Input
                      {...register("ciudad")}
                      id="ciudad"
                      placeholder={t('ciudadPlaceholder')}
                    />
                    {errors.ciudad && (
                      <p className="text-red-500 text-sm">{errors.ciudad.message}</p>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="space-y-1">
                    <Label htmlFor="estado">{t('estado')}</Label>
                    <Input
                      {...register("estado")}
                      id="estado"
                      placeholder={t('estadoPlaceholder')}
                    />
                    {errors.estado && (
                      <p className="text-red-500 text-sm">{errors.estado.message}</p>
                    )}
                  </div>

                  {/* Código Postal */}
                  <div className="space-y-1">
                    <Label htmlFor="codigo_postal">{t('codigoPostal')}</Label>
                    <Input
                      {...register("codigo_postal")}
                      id="codigo_postal"
                      placeholder={t('codigoPostalPlaceholder')}
                    />
                    {errors.codigo_postal && (
                      <p className="text-red-500 text-sm">{errors.codigo_postal.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Sección: Configuración de Usuario */}
              <div className="space-y-4">
                {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-500" />
                  Configuración de Usuario
                </h3> */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Rol */}
                  <div className="space-y-1">
                    <Label htmlFor="rol">{t('rol')}</Label>
                    <Select
                      value={form.watch("rol")}
                      onValueChange={(value) => setValue("rol", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('rolPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t('rolesLabel')}</SelectLabel>
                          {/* <SelectItem value="ADMIN">{t('rolAdmin')}</SelectItem> */}
                          {/* <SelectItem value="SUPERVISOR">{t('rolSupervisor')}</SelectItem> */}
                          <SelectItem value="TRABAJADOR">{t('rolTrabajador')}</SelectItem>
                          {/* <SelectItem value="CONTADOR">{t('rolContador')}</SelectItem> */}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.rol && (
                      <p className="text-red-500 text-sm">{errors.rol.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <Label htmlFor="status">{t('status')}</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) => setValue("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t('statusLabel')}</SelectLabel>
                          <SelectItem value="ACTIVO">{t('statusActivo')}</SelectItem>
                          <SelectItem value="INACTIVO">{t('statusInactivo')}</SelectItem>
                          <SelectItem value="SUSPENDIDO">{t('statusSuspendido')}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-red-500 text-sm">{errors.status.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-orange-400 hover:bg-orange-500">
              {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              {employeeToUpdate ? t('buttonUpdate') : t('buttonCreate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}