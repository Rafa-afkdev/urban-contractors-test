"use client";
import React, { useState, useEffect } from 'react'
import { deleteDocument, getCollection, updateDocument, increment } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { showToast } from 'nextjs-toast-notify';
import { Catalog } from '../../../../../../interfaces/calalog.interface';
import { Categorias } from '../../../../../../interfaces/categories.interface';
import { CardViewCatalogo } from './card-view-catalog';
import { CardTitle } from '@/components/ui/card';
import CreateUpdateCatalogo from './create-update-catalogo';
import { Button } from '@/components/ui/button';
import { CirclePlus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser } from '../../../../../../hooks/use-user';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CatalogComponent() {

    const [catalog, setCatalog] = useState<Catalog[]>([]);
    const [filteredCatalog, setFilteredCatalog] = useState<Catalog[]>([]);
    const [categories, setCategories] = useState<Categorias[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Catalog');
    const { user } = useUser();
    const userRole = (user as any)?.rol;

    useEffect(() => {
      getCatalog();
      getCategories();
    }, []);

    const getCatalog = async () => {
        const path = `catalogos`;
        setIsLoading(true);
        try {
          const res = (await getCollection(path)) as Catalog[];
          setCatalog(res);
          setFilteredCatalog(res);
        } catch (error) {
          console.error(error);
          showToast.error("Error al cargar catálogo", {
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

    const getCategories = async () => {
      try {
        const res = (await getCollection('categorias')) as Categorias[];
        setCategories(res);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    // Filtrar catálogo por categoría y búsqueda
    useEffect(() => {
      let filtered = [...catalog];

      // Filtrar por categoría
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.id_categoria === selectedCategory);
      }

      // Filtrar por búsqueda
      if (searchTerm.trim() !== '') {
        filtered = filtered.filter(item =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredCatalog(filtered);
    }, [selectedCategory, searchTerm, catalog]);
      
  const deleteCatalog = async (catalog: Catalog) => {
    const path = `catalogos/${catalog.id}`;
    setIsLoading(true);
    try {
      await deleteDocument(path);
      
      // Decrementar cantidad_servicios_asignados en la categoría
      if (catalog.id_categoria) {
        const categoryPath = `categorias/${catalog.id_categoria}`;
        await updateDocument(categoryPath, {
          cantidad_servicios_asignados: increment(-1)
        });
      }
      
      showToast.success("", {
        duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
      });
      getCatalog();
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
    <div>

        <div className="flex justify-between items-center mb-6">
          <CardTitle className="text-2xl">{t('title')} : {filteredCatalog.length}</CardTitle>
          {userRole !== 'TRABAJADOR' && (
            <CreateUpdateCatalogo getCatalogAction={getCatalog}>
              <Button variant="outline" className="flex items-center gap-2">
                <CirclePlus className="mr-2 w-5" />
                {t('ButtonAdd')}
              </Button>
            </CreateUpdateCatalogo>
          )}
        </div>

        {/* Filtros y Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder') || 'Buscar servicio por nombre...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por Categoría */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder={t('filterByCategory') || 'Filtrar por categoría'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories') || 'Todas las categorías'}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id!}>
                  {category.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CardViewCatalogo
          catalog={filteredCatalog}
          getCatalog={getCatalog}
          deleteCatalog={deleteCatalog}
          isLoading={isLoading}
          userRole={userRole}
        />
    </div>
  )
}
