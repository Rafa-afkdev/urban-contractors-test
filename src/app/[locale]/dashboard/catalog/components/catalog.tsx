"use client";
import React, { useState, useEffect } from 'react'
import { deleteDocument, getCollection } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { showToast } from 'nextjs-toast-notify';
import { Catalog } from '../../../../../../interfaces/calalog.interface';
import { CardViewCatalogo } from './card-view-catalog';
import { CardTitle } from '@/components/ui/card';
import CreateUpdateCatalogo from './create-update-catalogo';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CatalogComponent() {

    const [catalog, setCatalog] = useState<Catalog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Catalog');

    useEffect(() => {
      getCatalog();
    }, []);

    const getCatalog = async () => {
        const path = `catalogos`;
        // const query = [orderBy("createdAt", "desc")];
        setIsLoading(true);
        try {
          const res = (await getCollection(path)) as Catalog[];
          setCatalog(res);
        } catch (error) {
          console.error(error);
          showToast.error("Erro ao carregar catalog", {
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

      
  const deleteCatalog = async (catalog: Catalog) => {
    const path = `catalogos/${catalog.id}`;
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

        <div className="flex justify-between items-center mb-8">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CreateUpdateCatalogo getCatalogAction={getCatalog}>
            <Button variant="outline">
              <CirclePlus className="mr-2 w-5" />
              {t('ButtonAdd')}
            </Button>
          </CreateUpdateCatalogo>
        </div>

        <CardViewCatalogo
          catalog={catalog}
          getCatalog={getCatalog}
          deleteCatalog={deleteCatalog}
          isLoading={isLoading}
        />
    </div>
  )
}
