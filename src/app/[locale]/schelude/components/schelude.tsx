"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import Image from 'next/image'
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DateTimeFields } from './DateTimeFields';
import { StateCombobox } from '@/components/ui/state-combobox';
import { CalendarIcon, LoaderCircle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDocument } from '@/lib/firebase';
import { showToast } from 'nextjs-toast-notify';
import { useState } from 'react';

export default function Schelude() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useTranslations('Schelude');

  const formSchema = z.object({
    nombre: z.string().trim().min(1, { message: t('errors.required') }).min(2, { message: t('errors.minLength', { min: 2 }) }),
    apellido: z.string().trim().min(1, { message: t('errors.required') }).min(2, { message: t('errors.minLength', { min: 2 }) }),
    direccion: z.string().trim().min(1, { message: t('errors.required') }).min(2, { message: t('errors.minLength', { min: 2 }) }),
    direccion2: z.string().trim().min(1, { message: t('errors.required') }).min(2, { message: t('errors.minLength', { min: 2 }) }),
    ciudad: z.string().trim().min(1, { message: t('errors.required') }).min(2, { message: t('errors.minLength', { min: 2 }) }),
    estado: z.string().trim().min(1, { message: t('errors.required') }).min(2, { message: t('errors.minLength', { min: 2 }) }),
    codigo_postal: z.string().trim().min(1, { message: t('errors.required') }).min(4, { message: t('errors.minLength', { min: 5 }) }),
    telefono: z.string().trim().min(1, { message: t('errors.required') }).min(6, { message: t('errors.minLength', { min: 6 }) }),
    email: z.string().trim().min(1, { message: t('errors.required') }).min(6, { message: t('errors.minLength', { min: 6 }) }),
    fecha: z.string().min(1, { message: t('errors.required') }),
    hora: z.string().trim().min(1, { message: t('errors.required') }),
    notas: z.string().optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      direccion: '',
      direccion2: '',
      ciudad: '',
      estado: '',
      codigo_postal: '',
      telefono: '',
      email: '',
      fecha: '',
      hora: '',
      notas: '',
    }
  });

  
  const { register, handleSubmit, formState, control } = form;
  const { errors } = formState;
  
  //? ============== ENVIAR SOLICITUD =============//
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

      try {
        // Convert date from yyyy-mm-dd to dd/mm/yyyy format
        const formatDate = (dateString: string) => {
          const [year, month, day] = dateString.split('-');
          return `${day}/${month}/${year}`;
        };

        const schelude = {
          ...data,
          nombre: data.nombre.toUpperCase(),
          apellido: data.apellido.toUpperCase(),
          ciudad: data.ciudad.toUpperCase(),
          estado: data.estado.toUpperCase(),
          direccion: data.direccion.toUpperCase(),
          direccion2: data.direccion2.toUpperCase(),
          telefono: data.telefono.toUpperCase(),
          email: data.email,
          fecha: formatDate(data.fecha),
          hora: data.hora,
          notas: data.notas || '',
          status: "PENDIENTE"
        }

      // Add document if no duplicates found
      await addDocument('citas_agendadas', schelude);
      showToast.success(t('SucessToast'));
      form.reset();
    } catch (error: any) {
      console.error('Error:', error);
      showToast.error(t('ErrorToast'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/Fondo.jpeg"
        alt="Background"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover blur-sm"
      />
      
      <div className="relative min-h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <Image src="/Logo.png" alt="Logo" width={180} height={38} />
        </div>
        
        <Card className="w-full max-w-3xl mx-auto shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('titulo')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {t('descripcion')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('nombre')}</Label>
                  <Input
                    id="nombre"
                    placeholder={t('nombrePlaceholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    {...register('nombre')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.nombre?.message}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('apellido')}</Label>
                  <Input
                    id="apellido"
                    placeholder={t('apellidoPlaceholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    {...register('apellido')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.apellido?.message}</p>
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('direccion')}</Label>
                  <Input
                    id="direccion"
                    placeholder={t('direccionPlaceholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    {...register('direccion')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.direccion?.message}</p>
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('direccion2')}</Label>
                  <Input
                    id="direccion2"
                    placeholder={t('direccion2Placeholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    {...register('direccion2')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.direccion2?.message}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('ciudad')}</Label>
                  <Input
                    id="ciudad"
                    placeholder={t('ciudadPlaceholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    {...register('ciudad')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.ciudad?.message}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('estado')}</Label>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <StateCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('estadoPlaceholder')}
                        error={errors.estado?.message as string}
                      />
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('codigo_postal')}</Label>
                  <Input
                    id="codigo_postal"
                    placeholder={t('codigo_postalPlaceholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    {...register('codigo_postal')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.codigo_postal?.message}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('telefono')}</Label>
                  <Input
                    id="telefono"
                    placeholder={t('telefonoPlaceholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    {...register('telefono')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.telefono?.message}</p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('email')}</Label>
                  <Input
                    id="email"
                    placeholder={t('emailPlaceholder')}
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    {...register('email')}
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
                </div>
                <DateTimeFields
                  dateLabel={t('fecha')}
                  datePlaceholder={t('fechaPlaceholder')}
                  timeLabel={t('hora')}
                  timePlaceholder={t('horaPlaceholder')}
                  register={register}
                  errors={errors}
                />
               
                <div className="grid gap-2 col-span-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">{t('notas')}</Label>
                  <textarea
                    id="notas"
                    className="flex min-h-[100px] w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 focus:outline-none transition-all duration-200 resize-none"
                    placeholder={t('notasPlaceholder')}
                    {...register('notas')}
                  />
                </div>
              </div>

              <CardFooter className="mt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarIcon className="mr-2 h-5 w-5" />
                  )}
                  {t('submit')}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}