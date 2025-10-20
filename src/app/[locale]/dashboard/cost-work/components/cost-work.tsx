"use client";
import React, { useState, useEffect } from 'react'
import { deleteDocument, getCollection } from '@/lib/firebase';
import { showToast } from 'nextjs-toast-notify';
import { LaborCost } from '../../../../../../interfaces/labor-cost.interface';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CreateUpdateLaborCost } from './create-update-labor-cost';
import { TableLaborCostView } from './table-view-labor-cost';


export default function CostWorkComponent() {

    const [laborCosts, setLaborCosts] = useState<LaborCost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('LaborCost');

    useEffect(() => {
      getLaborCosts();
    }, []);

    const getLaborCosts = async () => {
        const path = `costos_mano_obra`;
        setIsLoading(true);
        try {
          const res = (await getCollection(path)) as LaborCost[];
          setLaborCosts(res);
        } catch (error) {
          console.error(error);
          showToast.error("Error al cargar costos de mano de obra", {
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

      
  const deleteLaborCost = async (laborCost: LaborCost) => {
    const path = `costos_mano_obra/${laborCost.id}`;
    setIsLoading(true);
    try {
      await deleteDocument(path);
      showToast.success("Costo eliminado exitosamente", {
        duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
      });
      getLaborCosts();
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
          <CardTitle className="text-2xl">{t('title')} : {laborCosts.length}</CardTitle>
          <CreateUpdateLaborCost getLaborCosts={getLaborCosts}>
            <Button variant="outline">
              <CirclePlus className="mr-2 w-5" />
              {t('ButtonAdd')}
            </Button>
          </CreateUpdateLaborCost>
        </div>

        <TableLaborCostView
          laborCosts={laborCosts}
          getLaborCosts={getLaborCosts}
          deleteLaborCost={deleteLaborCost}
          isLoading={isLoading}
        />
    </div>
  )
}
