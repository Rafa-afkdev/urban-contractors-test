/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { sentResetEmail } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import { useTranslations } from "next-intl";

const RecoverPassword = () => {
  const t = useTranslations('ForgotPasswordForm');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  //? ============== FORMULARIO ============//
  const formSchema = z.object({
    email: z.string().email("Ingresa un correo válido.").min(1, {
      message: "Este campo es obligatorio.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  //? ============== RECOVER PASSWORD =============//
  const onSubmit = async (user: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      await sentResetEmail(user.email);
      showToast.success(t('successMessage'));
      router.push('/auth');
    } catch (error) {     
      showToast.error(t('errorMessage')); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="w-full max-w-3xl mx-auto shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('titulo')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {t('descripcion')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
              {t('email')}
            </Label>
            <Input
              {...register("email")}
              id="email"
              placeholder={t('emailPlaceholder')}
              type="email"
              autoComplete="email"
              className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
            />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {t('submit')}
          </Button>
          <a href="./" className="text-orange-500 text-center underline">
            {t('backToLogin')}
          </a>
        </CardFooter>
      </Card>
    </form>
  );
};

export default RecoverPassword;