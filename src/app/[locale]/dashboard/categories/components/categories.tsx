"use client";
import React, { useState, useEffect } from 'react'
import { deleteDocument, getCollection } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { showToast } from 'nextjs-toast-notify';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Categorias } from '../../../../../../interfaces/categories.interface';
import { CreateUpdateCategory } from './create-update-categories';
import { TableCategoryView } from './table-view-categories';

export default function CategoriesComponent() {

    const [categories, setCategories] = useState<Categorias[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Categories');

    useEffect(() => {
      getCategories();
    }, []);

    const getCategories = async () => {
        const path = `categorias`;
        // const query = [orderBy("createdAt", "desc")];
        setIsLoading(true);
        try {
          const res = (await getCollection(path)) as Categorias[];
          setCategories(res);
        } catch (error) {
          console.error(error);
          showToast.error("Erro ao carregar categorias", {
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

      
  const deleteCategory = async (category: Categorias) => {
    const path = `categorias/${category.id}`;
    setIsLoading(true);
    try {
      await deleteDocument(path);
      showToast.success("", {
        duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
      });
      getCategories();
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

        <div className="flex justify-between items-center mb-8">
          <CardTitle className="text-2xl">{t('title')} : {categories.length}</CardTitle>
          <CreateUpdateCategory getCategories={getCategories}>
            <Button variant="outline">
              <CirclePlus className="mr-2 w-5" />
              {t('ButtonAdd')}
            </Button>
          </CreateUpdateCategory>
        </div>

        <TableCategoryView
          categories={categories}
          getCategories={getCategories}
          deleteCategory={deleteCategory}
          isLoading={isLoading}
        />
    </div>
  )
}
