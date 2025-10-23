/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiImageUpload from "@/components/ui/multi-image-upload";
import { addDocument, updateDocument, getCollection, getDocument, increment, uploadBase64 } from "@/lib/firebase";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, ClipboardEdit, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUser } from "../../../../../../hooks/use-user";
import { Catalog, CatalogoProductosRequeridos } from "../../../../../../interfaces/calalog.interface";
import { Categorias } from "../../../../../../interfaces/categories.interface";
import { useTranslations } from "next-intl";

interface CreateUpdateCatalogoProps {
  children: React.ReactNode;
  catalogToUpdate?: Catalog;
  getCatalogAction: () => Promise<void>;
}

export default function CreateUpdateCatalogo({
  children,
  catalogToUpdate,
  getCatalogAction,
}: CreateUpdateCatalogoProps) {
  const t = useTranslations('CreateUpdateCatalog');
  const user = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  // const [productosRequeridos, setProductosRequeridos] = useState<CatalogoProductosRequeridos[]>([]);
  const [categories, setCategories] = useState<Categorias[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const formSchema = z.object({
    images: z.array(z.string()).min(1, { message: t('validation.imageRequired') }),
    nombre: z.string().min(3, { message: t('validation.nameRequired') }),
    descripcion: z.string().min(3, { message: t('validation.descriptionRequired') }),
    precio: z.string().min(1, { message: t('validation.priceRequired') }),
    duracion_servicio: z.string().min(1, { message: t('validation.durationRequired') }),
    id_categoria: z.string().min(1, { message: t('validation.categoryRequired') }),
  });

  const tiposMedida = [
    { value: "unidad", label: t('measureTypes.unidad') },
    { value: "metro", label: t('measureTypes.metro') },
    { value: "metro_cuadrado", label: t('measureTypes.metro_cuadrado') },
    { value: "metro_cubico", label: t('measureTypes.metro_cubico') },
    { value: "kilogramo", label: t('measureTypes.kilogramo') },
    { value: "litro", label: t('measureTypes.litro') },
    { value: "pieza", label: t('measureTypes.pieza') },
    { value: "caja", label: t('measureTypes.caja') },
    { value: "paquete", label: t('measureTypes.paquete') },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
      nombre: "",
      descripcion: "",
      precio: "",
      duracion_servicio: "",
      id_categoria: "",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = (await getCollection('categorias')) as Categorias[];
        setCategories(res);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (catalogToUpdate) {
      // Cargar datos del catálogo a editar
      const catalogImages = catalogToUpdate.images && catalogToUpdate.images.length > 0 
        ? catalogToUpdate.images 
        : (catalogToUpdate.image ? [catalogToUpdate.image] : []);
      
      form.setValue("images", catalogImages);
      form.setValue("nombre", catalogToUpdate.nombre || "");
      form.setValue("descripcion", catalogToUpdate.descripcion || "");
      form.setValue("precio", catalogToUpdate.precio?.toString() || "");
      form.setValue("duracion_servicio", catalogToUpdate.duracion_servicio || "");
      form.setValue("id_categoria", catalogToUpdate.id_categoria || "");
      setSelectedCategory(catalogToUpdate.id_categoria || "");
      setImages(catalogImages);
      
      // Asegurar que productos_requeridos sea siempre un array
      // const productos = catalogToUpdate.productos_requeridos;
      // if (Array.isArray(productos)) {
      //   setProductosRequeridos(productos);
      // } else {
      //   setProductosRequeridos([]);
      // }
    } else {
      // Resetear para nuevo catálogo
      form.reset();
      setImages([]);
      // setProductosRequeridos([]);
      setSelectedCategory("");
    }
  }, [catalogToUpdate, open, form]);

  const handleImages = (imageUrls: string[]) => {
    setValue("images", imageUrls);
    setImages(imageUrls);
  };

  // const agregarProductoRequerido = () => {
  //   const currentProducts = Array.isArray(productosRequeridos) ? productosRequeridos : [];
  //   setProductosRequeridos([...currentProducts, {
  //     nombre: "",
  //     descripcion: "",
  //     tipo_medida: "unidad",
  //     cantidad: 1
  //   }]);
  // };

  // const eliminarProductoRequerido = (index: number) => {
  //   if (Array.isArray(productosRequeridos)) {
  //     setProductosRequeridos(productosRequeridos.filter((_, i) => i !== index));
  //   }
  // };

  // const actualizarProductoRequerido = (index: number, field: keyof CatalogoProductosRequeridos, value: string | number) => {
  //   if (Array.isArray(productosRequeridos) && productosRequeridos[index]) {
  //     const nuevosProductos = [...productosRequeridos];
  //     nuevosProductos[index] = { ...nuevosProductos[index], [field]: value };
  //     setProductosRequeridos(nuevosProductos);
  //   }
  // };

  const onSubmit = async (catalog: z.infer<typeof formSchema>) => {
    // const catalogWithProducts = {
    //   ...catalog,
    //   productos_requeridos: Array.isArray(productosRequeridos) ? productosRequeridos : []
    // };
    
    if (catalogToUpdate) {
      UpdateCatalog(catalog);
    } else {
      CreateCatalog(catalog);
    }
  };

  const CreateCatalog = async (catalog: any) => {
    const path = `catalogos`;
    setIsLoading(true);
    try {
      const uploadedUrls: string[] = [];
      const imagesStorage: { path: string; url: string }[] = [];
      for (let idx = 0; idx < (images || []).length; idx++) {
        const img = images[idx];
        if (img && img.startsWith("data:")) {
          const storagePath = `catalogos/${Date.now()}-${idx}`;
          const url = await uploadBase64(storagePath, img);
          uploadedUrls.push(url);
          imagesStorage.push({ path: storagePath, url });
        } else if (img) {
          // Already a URL
          uploadedUrls.push(img);
        }
      }
      const normalizedCatalog = {
        ...catalog,
        images: uploadedUrls,
        image: uploadedUrls[0] || undefined,
        images_storage: imagesStorage,
        nombre: catalog.nombre.toUpperCase(),
        descripcion: catalog.descripcion.toUpperCase(),
        created_at: new Date().toISOString(),
      };

      await addDocument(path, normalizedCatalog);
      
      // Incrementar cantidad_servicios_asignados en la categoría seleccionada
      if (catalog.id_categoria) {
        const categoryPath = `categorias/${catalog.id_categoria}`;
        await updateDocument(categoryPath, {
          cantidad_servicios_asignados: increment(1)
        });
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
      setImages([]);
      // setProductosRequeridos([]);
      setSelectedCategory("");
      getCatalogAction();
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

  const UpdateCatalog = async (catalog: any) => {
    const path = `catalogos/${catalogToUpdate?.id}`;
    setIsLoading(true);
    try {
      const previousStorage = (catalogToUpdate as any)?.images_storage as { path: string; url: string }[] | undefined;
      const uploadedUrls: string[] = [];
      const imagesStorage: { path: string; url: string }[] = [];
      for (let idx = 0; idx < (images || []).length; idx++) {
        const img = images[idx];
        if (img && img.startsWith("data:")) {
          const reusePath = previousStorage?.[idx]?.path;
          const storagePath = reusePath || `catalogos/${catalogToUpdate?.id || Date.now()}-${idx}`;
          const url = await uploadBase64(storagePath, img);
          uploadedUrls.push(url);
          imagesStorage.push({ path: storagePath, url });
        } else if (img) {
          uploadedUrls.push(img);
          const existing = previousStorage?.[idx] || previousStorage?.find(s => s.url === img);
          if (existing) imagesStorage.push(existing);
        }
      }
      const normalizedCatalog = {
        ...catalog,
        images: uploadedUrls,
        image: uploadedUrls[0] || undefined,
        images_storage: imagesStorage,
        nombre: catalog.nombre.toUpperCase(),
        descripcion: catalog.descripcion.toUpperCase(),
        updated_by: user?.user?.uid,
        updated_at: new Date().toISOString(),
      };

      // Si cambió la categoría, actualizar contadores
      if (catalogToUpdate?.id_categoria !== catalog.id_categoria) {
        // Decrementar en la categoría anterior
        if (catalogToUpdate?.id_categoria) {
          const oldCategoryPath = `categorias/${catalogToUpdate.id_categoria}`;
          await updateDocument(oldCategoryPath, {
            cantidad_servicios_asignados: increment(-1)
          });
        }
        
        // Incrementar en la nueva categoría
        if (catalog.id_categoria) {
          const newCategoryPath = `categorias/${catalog.id_categoria}`;
          await updateDocument(newCategoryPath, {
            cantidad_servicios_asignados: increment(1)
          });
        }
      }

      await updateDocument(path, normalizedCatalog);
      showToast.success(t('successUpdate'), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: "",
        sound: true,
      });
      getCatalogAction();
      setOpen(false);
      form.reset();
      setImages([]);
      // setProductosRequeridos([]);
      setSelectedCategory("");
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
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {catalogToUpdate ? t('titleUpdate') : t('titleCreate')}
            </DialogTitle>
            <DialogDescription>
              {t('description')}
            </DialogDescription>
          </DialogHeader>
          <Card className="border rounded-lg mt-4 w-full dark:bg-gray-900 dark:border-gray-700">
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              {/* Images upload */}
              <div className="space-y-1 col-span-2">
                <Label htmlFor="images" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {t('images')}
                </Label>
                <div className="w-full">
                  <MultiImageUpload 
                    handleImages={handleImages} 
                    initialImages={images}
                    maxImages={5}
                  />
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-1">
                <Label htmlFor="nombre">{t('name')}</Label>
                <Input
                  {...register("nombre")}
                  id="nombre"
                  placeholder={t('namePlaceholder')}
                />
              </div>

              {/* Preço */}
              <div className="space-y-1">
                <Label htmlFor="precio">{t('price')}</Label>
                <Input
                  {...register("precio")}
                  id="precio"
                  min={0}
                  step="0.01"
                  placeholder={t('pricePlaceholder')}
                />
              </div>

              {/* Duración del Servicio */}
              <div className="space-y-1 col-span-2">
                <Label htmlFor="duracion_servicio">{t('serviceDuration')}</Label>
                <Input
                  {...register("duracion_servicio")}
                  id="duracion_servicio"
                  placeholder={t('serviceDurationPlaceholder')}
                />
                {errors.duracion_servicio && (
                  <p className="text-sm text-red-500">{errors.duracion_servicio.message}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-1 col-span-2">
                <Label htmlFor="descripcion">{t('descriptionLabel')}</Label>
                <Input
                  {...register("descripcion")}
                  id="descripcion"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              {/* Categoría */}
              <div className="space-y-1 col-span-2">
                <Label htmlFor="id_categoria">{t('category')}</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                    >
                      {selectedCategory
                        ? categories.find((cat) => cat.id === selectedCategory)?.nombre
                        : t('categoryPlaceholder')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t('categorySearch')} className="h-9" />
                      <CommandList>
                        <CommandEmpty>{t('categoryNotFound')}</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.nombre}
                              onSelect={() => {
                                const newValue = category.id === selectedCategory ? "" : category.id || "";
                                setSelectedCategory(newValue);
                                setValue("id_categoria", newValue);
                                setOpenCombobox(false);
                              }}
                            >
                              {category.nombre}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedCategory === category.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.id_categoria && (
                  <p className="text-sm text-red-500">{errors.id_categoria.message}</p>
                )}
              </div>

              {/* Produtos Requeridos - COMENTADO */}
              {/* <div className="space-y-4 col-span-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{t('requiredProducts')}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarProductoRequerido}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('addProduct')}
                  </Button>
                </div>

                {(!Array.isArray(productosRequeridos) || productosRequeridos.length === 0) && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 rounded-lg border-2 border-dashed dark:border-gray-600">
                    <p>{t('noProducts')}</p>
                    <p className="text-sm">{t('noProductsHint')}</p>
                  </div>
                )}

                {Array.isArray(productosRequeridos) && productosRequeridos.map((producto, index) => (
                  <Card key={index} className="p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">{t('product')} {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarProductoRequerido(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>{t('productName')}</Label>
                        <Input
                          value={producto.nombre}
                          onChange={(e) => actualizarProductoRequerido(index, 'nombre', e.target.value)}
                          placeholder={t('productNamePlaceholder')}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>{t('measureType')}</Label>
                        <Select
                          value={producto.tipo_medida}
                          onValueChange={(value) => actualizarProductoRequerido(index, 'tipo_medida', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('measureTypePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposMedida.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>{t('quantity')}</Label>
                        <Input
                          type="number"
                          min={1}
                          value={producto.cantidad || ''}
                          onChange={(e) => actualizarProductoRequerido(index, 'cantidad', parseInt(e.target.value) || 1)}
                          placeholder={t('quantityPlaceholder')}
                        />
                      </div>

                      <div className="space-y-1 md:col-span-1">
                        <Label>{t('productDescription')}</Label>
                        <Input
                          value={producto.descripcion}
                          onChange={(e) => actualizarProductoRequerido(index, 'descripcion', e.target.value)}
                          placeholder={t('productDescriptionPlaceholder')}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div> */}
            </CardContent>

            <CardFooter className="flex justify-center items-center">
              <Button type="submit" disabled={isLoading} className="flex-center bg-orange-400">
                <ClipboardEdit className="mr-2" />
                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {catalogToUpdate ? t('buttonUpdate') : t('buttonCreate')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}