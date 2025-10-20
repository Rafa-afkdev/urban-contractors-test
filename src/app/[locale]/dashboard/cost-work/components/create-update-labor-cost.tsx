/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addDocument, updateDocument, getCollection } from "@/lib/firebase";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, LoaderCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "nextjs-toast-notify";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LaborCost } from "../../../../../../interfaces/labor-cost.interface";
import { Catalog } from "../../../../../../interfaces/calalog.interface";
import { useTranslations } from "next-intl";

interface CreateUpdateLaborCostProps {
  children: React.ReactNode;
  laborCostToUpdate?: LaborCost;
  getLaborCosts: () => Promise<void>;
}

export function CreateUpdateLaborCost({
  children,
  laborCostToUpdate,
  getLaborCosts,
}: CreateUpdateLaborCostProps) {
  const t = useTranslations('CreateUpdateLaborCost');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Catalog[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const formSchema = z.object({
    id_servicio: z.string().min(1, { message: t('validation.serviceRequired') }),
    costo_mano_obra: z.string().min(1, { message: t('validation.costRequired') }),
    descripcion: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_servicio: "",
      costo_mano_obra: "",
      descripcion: "",
    },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;

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

  useEffect(() => {
    if (laborCostToUpdate) {
      form.setValue("id_servicio", laborCostToUpdate.id_servicio || "");
      form.setValue("costo_mano_obra", laborCostToUpdate.costo_mano_obra?.toString() || "");
      form.setValue("descripcion", laborCostToUpdate.descripcion || "");
      setSelectedService(laborCostToUpdate.id_servicio || "");
    } else {
      form.reset();
      setSelectedService("");
    }
  }, [laborCostToUpdate, open, form]);

  const onSubmit = async (laborCost: z.infer<typeof formSchema>) => {
    if (laborCostToUpdate) {
      UpdateLaborCost(laborCost);
    } else {
      CreateLaborCost(laborCost);
    }
  };

  const CreateLaborCost = async (laborCost: any) => {
    const path = `costos_mano_obra`;
    setIsLoading(true);
    try {
      const selectedServiceData = services.find(s => s.id === laborCost.id_servicio);
      
      const normalizedLaborCost = {
        ...laborCost,
        costo_mano_obra: parseFloat(laborCost.costo_mano_obra),
        nombre_servicio: selectedServiceData?.nombre || "",
        created_at: new Date().toISOString(),
      };

      await addDocument(path, normalizedLaborCost);
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
      setSelectedService("");
      getLaborCosts();
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

  const UpdateLaborCost = async (laborCost: any) => {
    const path = `costos_mano_obra/${laborCostToUpdate?.id}`;
    setIsLoading(true);
    try {
      const selectedServiceData = services.find(s => s.id === laborCost.id_servicio);
      
      const normalizedLaborCost = {
        ...laborCost,
        costo_mano_obra: parseFloat(laborCost.costo_mano_obra),
        nombre_servicio: selectedServiceData?.nombre || "",
        updated_at: new Date().toISOString(),
      };

      await updateDocument(path, normalizedLaborCost);
      showToast.success(t('successUpdate'), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
      getLaborCosts();
      setOpen(false);
      form.reset();
      setSelectedService("");
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
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {laborCostToUpdate ? t('titleUpdate') : t('titleCreate')}
            </DialogTitle>
            <DialogDescription>
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Servicio */}
            <div className="space-y-2">
              <Label htmlFor="id_servicio">{t('service')}</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {selectedService
                      ? services.find((service) => service.id === selectedService)?.nombre
                      : t('servicePlaceholder')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t('serviceSearch')} className="h-9" />
                    <CommandList>
                      <CommandEmpty>{t('serviceNotFound')}</CommandEmpty>
                      <CommandGroup>
                        {services.map((service) => (
                          <CommandItem
                            key={service.id}
                            value={service.nombre}
                            onSelect={() => {
                              const newValue = service.id === selectedService ? "" : service.id || "";
                              setSelectedService(newValue);
                              setValue("id_servicio", newValue);
                              setOpenCombobox(false);
                            }}
                          >
                            {service.nombre}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedService === service.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.id_servicio && (
                <p className="text-sm text-red-500">{errors.id_servicio.message}</p>
              )}
            </div>

            {/* Costo de Mano de Obra */}
            <div className="space-y-2">
              <Label htmlFor="costo_mano_obra">{t('cost')}</Label>
              <Input
                {...register("costo_mano_obra")}
                id="costo_mano_obra"
                type="number"
                step="0.01"
                min="0"
                placeholder={t('costPlaceholder')}
              />
              {errors.costo_mano_obra && (
                <p className="text-sm text-red-500">{errors.costo_mano_obra.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">{t('descriptionLabel')}</Label>
              <Input
                {...register("descripcion")}
                id="descripcion"
                placeholder={t('descriptionPlaceholder')}
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
              {laborCostToUpdate ? t('buttonUpdate') : t('buttonCreate')}
            <Plus/>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
