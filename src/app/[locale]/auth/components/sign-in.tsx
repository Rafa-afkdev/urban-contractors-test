/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getDocument } from "@/lib/firebase";
import { setInLocalstorage } from "../../../../../actions/set-in-LocalStorage";
import { LoaderCircle, LogIn } from "lucide-react"
import { showToast } from "nextjs-toast-notify";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "@/i18n/routing";

  export default function SignInForm (){
  
    const t = useTranslations('SignInForm');
    const [isLoading, setisLoading] = useState<boolean>(false)
    const router = useRouter();
  
    //? ============== FORMULARIO ============//
    const formSchema = z.object({
        email: z
          .string()
          .min(1, { message: t('required') })
          .email({ message: t('invalidEmail') }),
        password: z
          .string()
          .min(1, { message: t('required') })
          .min(6, { message: t('minLength', { min: 6 }) })
      });
        
        const form = useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema),
          defaultValues:{
              email: '',
              password: '',
          }
        })

        const { register, handleSubmit, formState } = form;
        const { errors } = formState;

      //? ============== SING IN =============//

      const onSubmit = async (user: z.infer<typeof formSchema>) => {
        console.log(user);

        setisLoading(true);
        try {
          const res = await signIn(user);
          console.log(res);
          
          // Fetch user data from Firestore and save to localStorage
          if (res.user) {
            try {
              const userData = await getDocument(`users/${res.user.uid}`);
              if (userData) {
                setInLocalstorage('user', userData);
                console.log('User data saved to localStorage:', userData);
              } else {
                console.warn('No user document found in Firestore for UID:', res.user.uid);
              }
            } catch (dbError: any) {
              console.error('Error fetching user data from Firestore:', dbError);
            }
          }
          
          // Redirect to locale-aware dashboard
          router.push('/dashboard');
            
        } catch (error:any) {
            showToast.error(error.message, {})
            
        }finally{
            setisLoading(false);
        }

      } 

    return (
        <>
        
        <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="w-full max-w-3xl mx-auto shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
        <CardTitle>{t('titulo')}</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  {...register("email")}
                  id="email"
                  placeholder={t('emailPlaceholder')}
                  type="email"
                  autoComplete="email"
                />
                <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
              </div>
    
              <div className="space-y-1">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                />
                <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" disabled={isLoading} 
                            className="w-full h-12 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200"
>
                {isLoading && (<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />)}
                {t('submit')}
              <LogIn/>
              </Button>
              <Link href="auth/forgot-password" className="text-orange-500 text-center underline">
                {t('forgotPassword')}
              </Link>
            </CardFooter>
          </Card>
        </form>
        </>
      );
}
