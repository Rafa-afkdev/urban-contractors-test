"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import React from "react";
import SignInForm from "./components/sign-in";

const AuthPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="relative flex items-center justify-center h-screen overflow-hidden">
        {/* Imagen de fondo desenfocada */}
         <Image
                src="/Fondo.jpeg"
                alt="Background"
                fill
                priority
                sizes="100vw"
                className="-z-10 object-cover blur-sm"
              />
        {/* Contenedor principal */}
        <div className="relative z-10 flex flex-col items-center justify-between w-full max-w-screen-lg p-4 space-y-8 md:p-8 md:flex-row md:space-y-0">
          {/* Logo con animación */}
          <div
            className={`flex items-center justify-center transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
            }`}
          >
            {/* Manejo de errores para el componente Image */}
            {isVisible && (
              <Image
                src="/Logo.png"
                alt="Logo"
                width={300}
                height={150}
                className="object-cover"
                priority
                onError={(e) => console.error("Error cargando la imagen:", e)}
              />
            )}
          </div>

          {/* Formulario de inicio de sesión */}
          <div
            className={`w-full max-w-xs transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            }`}
          >
            <SignInForm />
          </div>
        </div>
       
      </div>
    </>
  );
};

export default AuthPage;