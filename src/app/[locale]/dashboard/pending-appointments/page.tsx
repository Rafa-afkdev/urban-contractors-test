"use client";
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PendingAppointments from './components/table-pending-appointments';
import { Scheludes } from '../../../../../interfaces/scheludes.interface';
import { useTranslations } from 'next-intl';

export default function SchedulePage() {
    const t = useTranslations('PendingAppointmentsPage');
  const [appointments, setAppointments] = useState<Scheludes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  const getAppointments = () => {
    setIsLoading(true);
    try {
      const appointmentsRef = collection(db, 'citas_agendadas');
      const q = query(
        appointmentsRef, 
        where('status', '==', 'PENDIENTE')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const appointmentsData: Scheludes[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Scheludes[];
          
          // Ordenar por fecha y hora en el cliente
          const sortedAppointments = appointmentsData.sort((a, b) => {
            // Convertir fecha de "dd/MM/yyyy" a objeto Date
            const [dayA, monthA, yearA] = a.fecha.toString().split('/');
            const [dayB, monthB, yearB] = b.fecha.toString().split('/');
            
            const dateA = new Date(`${yearA}-${monthA}-${dayA}T${a.hora}`);
            const dateB = new Date(`${yearB}-${monthB}-${dayB}T${b.hora}`);
            
            return dateA.getTime() - dateB.getTime(); // Orden ascendente (más antigua primero)
          });
          
          setAppointments(sortedAppointments);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching appointments:', error);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up appointments listener:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = getAppointments();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      {t('title')}
        </h1>
      </div>
      <PendingAppointments 
        appointments={appointments}
        getAppointmentsAction={getAppointments}
        isLoading={isLoading}
      />
    </div>
  );
}