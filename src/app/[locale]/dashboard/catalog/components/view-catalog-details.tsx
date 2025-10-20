/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Catalog } from "../../../../../../interfaces/calalog.interface";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getDocument } from "@/lib/firebase";

interface ViewCatalogDetailsProps {
  children: React.ReactNode;
  catalog: Catalog;
}

export function ViewCatalogDetails({
  children,
  catalog,
}: ViewCatalogDetailsProps) {
  const t = useTranslations("ViewCatalogDetails");
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      if (catalog.id_categoria) {
        setLoading(true);
        try {
          const categoryDoc = await getDocument(`categorias/${catalog.id_categoria}`);
          if (categoryDoc) {
            setCategoryName((categoryDoc as any).nombre || "N/A");
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          setCategoryName("N/A");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategory();
  }, [catalog.id_categoria]);

  const images = catalog.images && catalog.images.length > 0 
    ? catalog.images 
    : catalog.image 
    ? [catalog.image] 
    : [];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Carrusel de Imágenes */}
          {images.length > 0 && (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={image}
                          alt={`${catalog.nombre} - Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
              {images.length > 1 && (
                <div className="text-center mt-2 text-sm text-gray-500">
                  {images.length} {t("images")}
                </div>
              )}
            </div>
          )}

          {/* Información del Servicio */}
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("serviceName")}
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {catalog.nombre}
              </p>
            </div>

            {/* Precio Base */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("basePrice")}
              </label>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ${typeof catalog.precio === 'string' ? catalog.precio : catalog.precio?.toFixed(2)}
              </p>
            </div>

            {/* Duración del Servicio */}
            {catalog.duracion_servicio && (
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("serviceDuration")}
                </label>
                <p className="text-base text-gray-900 dark:text-white mt-1">
                  {catalog.duracion_servicio}
                </p>
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("serviceDescription")}
              </label>
              <p className="text-base text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                {catalog.descripcion}
              </p>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("category")}
              </label>
              <div className="mt-1">
                {loading ? (
                  <Badge variant="outline" className="text-sm">
                    {t("loading")}...
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm">
                    {categoryName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Productos Requeridos */}
            {catalog.productos_requeridos && catalog.productos_requeridos.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("requiredProducts")}
                </label>
                <div className="space-y-2">
                  {catalog.productos_requeridos.map((producto, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {producto.nombre}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {producto.descripcion}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <span>{t("measureType")}: {producto.tipo_medida}</span>
                        {producto.cantidad && (
                          <span>• {t("quantity")}: {producto.cantidad}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
