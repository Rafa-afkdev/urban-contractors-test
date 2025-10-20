/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutList, SquarePen, Trash2, Eye } from "lucide-react";
import { ConfirmDeletion } from "./confirm-deletion-catalogo";
import { Catalog } from "../../../../../../interfaces/calalog.interface";
import CreateUpdateCatalogo from "./create-update-catalogo";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ViewCatalogDetails } from "./view-catalog-details";

export function CardViewCatalogo({
  catalog,
  getCatalog,
  deleteCatalog,
  isLoading,
  userRole,
}: {
  catalog: Catalog[];
  getCatalog: () => Promise<void>;
  deleteCatalog: (catalog: Catalog) => Promise<void>;
  isLoading: boolean;
  userRole?: string;
}) {
  return (
    <div className="max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-hide">
      {/* Grid de productos estilo ecommerce */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {!isLoading &&
          catalog.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white dark:bg-gray-800 border-0 shadow-sm overflow-hidden">
              <div className="relative">
                {/* Carrusel de imágenes del producto */}
                <ImageCarousel
                  images={item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : [])}
                  alt={item.nombre}
                  aspectRatio="video"
                  className="group-hover:scale-105 transition-transform duration-300"
                />

                {/* Botones de acción flotantes */}
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ViewCatalogDetails catalog={item}>
                    <Button
                      size="icon"
                      className="h-7 w-7 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 shadow-md border-0"
                      title="Ver detalles"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </ViewCatalogDetails>
                  
                  {userRole !== 'TRABAJADOR' && (
                    <>
                      <CreateUpdateCatalogo
                        getCatalogAction={getCatalog}
                        catalogToUpdate={item}
                      >
                        <Button
                          size="icon"
                          className="h-7 w-7 bg-white/90 hover:bg-white text-gray-700 hover:text-orange-600 shadow-md border-0"
                          title="Editar"
                        >
                          <SquarePen className="w-3.5 h-3.5" />
                        </Button>
                      </CreateUpdateCatalogo>
                      <ConfirmDeletion
                        deleteCatalog={deleteCatalog}
                        catalog={item}
                      >
                        <Button
                          size="icon"
                          className="h-7 w-7 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 shadow-md border-0"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </ConfirmDeletion>
                    </>
                  )}
                </div>
              </div>

              <CardContent className="p-3">
                {/* Nombre del producto */}
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                  {item.nombre}
                </h3>

                {/* Descripción */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                  {item.descripcion}
                </p>

                {/* Precio */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-orange-600">
                    ${typeof item.precio === 'string' ? item.precio : item.precio?.toFixed(2)}
                  </span>
                  
                  {/* Badge de disponibilidad */}
                  <div className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
                    Disponible
                  </div>
                </div>

                {/* Productos requeridos (si existen) */}
                {Array.isArray(item.productos_requeridos) && item.productos_requeridos.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.productos_requeridos.length} producto{item.productos_requeridos.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

        {/* Skeletons de carga estilo ecommerce */}
        {isLoading &&
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video">
                <Skeleton className="w-full h-full animate-pulse" />
              </div>
              <CardContent className="p-3">
                <Skeleton className="h-4 w-full mb-1 animate-pulse" />
                <Skeleton className="h-3 w-3/4 mb-2 animate-pulse" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-16 animate-pulse" />
                  <Skeleton className="h-4 w-16 rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Mensaje cuando no hay registros */}
        {!isLoading && catalog.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <LayoutList className="w-10 h-10 text-orange-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay productos en el catálogo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comienza agregando tu primer producto al catálogo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}