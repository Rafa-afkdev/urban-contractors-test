"use client";
import React, { useState, useEffect } from 'react';
import { getCollection } from '@/lib/firebase';
import { showToast } from 'nextjs-toast-notify';
import { Client } from '../../../../../../interfaces/clients.interface';
import { Project } from '../../../../../../interfaces/projects.interface';
import { CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TableViewClients } from './table-view-clients';

export default function ClientsComponent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Clients');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientsData, projectsData] = await Promise.all([
        getCollection('clientes') as Promise<Client[]>,
        getCollection('proyectos') as Promise<Project[]>,
      ]);
      
      setClients(clientsData);
      setFilteredClients(clientsData);
      setProjects(projectsData);
    } catch (error) {
      console.error(error);
      showToast.error("Error al cargar clientes", {
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

  // Buscar clientes por nombre o email
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        `${client.nombre} ${client.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  // Función para obtener estadísticas de un cliente
  const getClientStats = (clientId: string) => {
    const clientProjects = projects.filter(p => p.cliente_id === clientId);
    return {
      total: clientProjects.length,
      completados: clientProjects.filter(p => p.status === 'COMPLETADO').length,
      enProceso: clientProjects.filter(p => p.status === 'EN_PROCESO').length,
      cancelados: clientProjects.filter(p => p.status === 'CANCELADO').length,
    };
  };

  // Función para obtener proyectos de un cliente
  const getClientProjects = (clientId: string): Project[] => {
    return projects.filter(p => p.cliente_id === clientId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <CardTitle className="text-2xl">{t('title')} : {filteredClients.length}</CardTitle>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder') || 'Buscar por nombre o email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <TableViewClients
        clients={filteredClients}
        getClientStats={getClientStats}
        getClientProjects={getClientProjects}
        isLoading={isLoading}
      />
    </div>
  );
}
