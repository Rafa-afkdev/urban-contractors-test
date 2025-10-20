 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
import { LoaderCircle } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
// import DragAndDropImage from "@/components/ui/drag-and-drop-image";
import {
  addDocument,
  getCollection,
  updateDocument,
  // uploadBase64,
} from "@/lib/firebase";
// import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as React from "react";
import { Categorias } from "../../../../../../interfaces/categories.interface";
import { useTranslations } from "next-intl";
import { showToast } from "nextjs-toast-notify";

interface CreateUpdateCategoryProps {
  children: React.ReactNode;
  categoryToUpdate?: Categorias;
  getCategories: () => Promise<void>
}

export function CreateUpdateCategory({
  children,
  categoryToUpdate,
  getCategories
}: CreateUpdateCategoryProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const t = useTranslations('CreateUpdateCategories');

  // const [image, setImage] = useState<string>("");

  const formSchema = z.object({
    nombre: z.string().min(3, { message: t('validation.nombresRequired') }),
    descripcion: z.string().min(3, { message: t('validation.descripcionRequired') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: categoryToUpdate
      ? categoryToUpdate
      : {
          nombre: "",
          descripcion: "",
          
        },
  });



  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  //! SUBIR O ACTUALIZAR LA IMAGEN
  // const handleImage = (url: string) => {
  //   const path = studentToUpdate ? studentToUpdate.image.path : `${Date.now()}`;
  //   setValue("image", { url, path });
  //   setImage(url);
  // };

  // useEffect(() => {
  //   if (studentToUpdate) setImage(studentToUpdate.image.url);
  // }, [open]);
  

  //  TODO ====== FUNCION DE SUBMIT =========///
  const onSubmit = async (category: z.infer<typeof formSchema>) => {
    if (categoryToUpdate) {
      UpdateCategory(category);
    } else {
      CreateCategory(category);
    }
  };


  //TODO // CREAR UN ESTUDIANTE EN LA DATABASE ////

  const CreateCategory = async (category: Categorias) => {
    const path = `categorias`;
    setIsLoading(true);
  
    try {
       
      const normalizedCategory = {
        ...category,        
        nombre: category.nombre.toUpperCase(),
        descripcion: category.descripcion.toUpperCase(),
        cantidad_servicios_asignados: 0
      };
  
      await addDocument(path, normalizedCategory);
      showToast.success(t('showToast.successCreate'));
      getCategories();
      setOpen(false);
      form.reset();
    } catch (error: any) {
      showToast.error(error.message, { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };
  //TODO // ACTUALIZAR UN ESTUDIANTE EN LA DATABASE ////

  const UpdateCategory = async (category: Categorias) => {
    const path = `categorias/${categoryToUpdate?.id}`;
    setIsLoading(true);
  
    try {  
      const normalizedCategory = {
        ...category,
        nombre: category.nombre.toUpperCase(),
        descripcion: category.descripcion.toUpperCase(),
        cantidad_servicios_asignados: categoryToUpdate?.cantidad_servicios_asignados
      };
    
      await updateDocument(path, normalizedCategory);
      showToast.success(t('showToast.successUpdate'));
      getCategories();
      setOpen(false);
      form.reset();
    } catch (error: any) {
      showToast.error(error.message, { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[850px] max-h-[190vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-xl font-bold dark:text-gray-100">
              {categoryToUpdate ? t('DialogTitle.titleUpdate') : t('DialogTitle.titleCreate')}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {categoryToUpdate
                ? t('DialogDescription.descriptionUpdate')
                : t('DialogDescription.descriptionCreate')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
 
            <div className="grid grid-cols-2 gap-4">
                {/* Cédula */}
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="cedula" className="text-right">
                    {t('DialogContent.nombreCategoria')}
                  </Label>
                  <Input
                    {...register("nombre")}
                    id="nombre"
                    // type="tex"
                    placeholder={t("DialogContent.nombrePlaceholder")}
                    className="col-span-2"
                    maxLength={11} // Evita que se escriban más de 11 caracteres
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      if (input.value.length > 11) {
                        input.value = input.value.slice(0, 11);
                      }
                    }}
                    onBlur={() => {
                      form.trigger("nombre"); // Valida el campo manualmente al perder el foco
                    }}
                  />
                  {errors.nombre && (
                    <p className="text-red-500">{errors.nombre.message}</p>
                  )}
                </div>

                {/* NOMBRES */}
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="descripcion" className="text-right">
                    Descripcion
                  </Label>
                  <Input
                    {...register("descripcion")}
                    id="descripcion"
                    type="text"
                    placeholder={t("DialogContent.descripcionPlaceholder")}
                    className="col-span-2"
                    maxLength={60} 
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      if (input.value.length > 60) {
                        input.value = input.value.slice(0, 60);
                      }
                    }}
                    onBlur={() => {
                      form.trigger("descripcion"); 
                    }}
                  />
                  {errors.descripcion && (
                    <p className="text-red-500">{errors.descripcion.message}</p>
                  )}
                </div>

            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              {categoryToUpdate ? t('DialogContent.buttonUpdate') : t('DialogContent.buttonCreate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
