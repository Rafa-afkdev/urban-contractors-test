"use client";
import React, { useState, useEffect } from 'react'
import { deleteDocument, getCollection, updateDocument } from '@/lib/firebase';
import { showToast } from 'nextjs-toast-notify';
import { Project } from '../../../../../../interfaces/projects.interface';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CirclePlus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TableProjectsView } from './table-view-projects';
import { CreateUpdateProject } from './create-update-project';
import { Input } from '@/components/ui/input';
import { useUser } from '../../../../../../hooks/use-user';

export default function ProjectsComponent() {

    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Projects');
    const { user } = useUser();

    useEffect(() => {
      getProjects();
    }, []);

    const getProjects = async () => {
        const path = `proyectos`;
        setIsLoading(true);
        try {
          let res = (await getCollection(path)) as Project[];
          
          // Filtrar por rol de usuario
          const userRole = (user as any)?.rol;
          if (userRole === 'TRABAJADOR') {
            // Mostrar solo proyectos del trabajador autenticado
            res = res.filter(project => project.trabajador_uid === user?.uid);
          }
          // Si es ADMIN, muestra todos los proyectos
          
          setProjects(res);
          setFilteredProjects(res);
        } catch (error) {
          console.error(error);
          showToast.error("Error al cargar proyectos", {
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

    // Buscar proyectos por nombre de cliente o email
    useEffect(() => {
      if (searchTerm.trim() === '') {
        setFilteredProjects(projects);
      } else {
        const filtered = projects.filter(project => 
          project.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.cliente_email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProjects(filtered);
      }
    }, [searchTerm, projects]);

    // Actualizar estado del proyecto
    const updateProjectStatus = async (projectId: string, newStatus: "COMPLETADO" | "CANCELADO") => {
      const path = `proyectos/${projectId}`;
      setIsLoading(true);
      try {
        await updateDocument(path, { 
          status: newStatus,
          fecha_fin: newStatus === "COMPLETADO" ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString()
        });
        showToast.success(`Proyecto marcado como ${newStatus === "COMPLETADO" ? "completado" : "cancelado"}`, {
          duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
        });
        getProjects();
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
      
  const deleteProject = async (project: Project) => {
    const path = `proyectos/${project.id}`;
    setIsLoading(true);
    try {
      await deleteDocument(path);
      showToast.success("Proyecto eliminado exitosamente", {
        duration: 2500,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
          icon: '',
          sound: true,
      });
      getProjects();
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
          <CardTitle className="text-2xl">{t('title')} : {filteredProjects.length}</CardTitle>
          <CreateUpdateProject getProjects={getProjects}>
            <Button variant="outline">
              <CirclePlus className="mr-2 w-5" />
              {t('ButtonAdd')}
            </Button>
          </CreateUpdateProject>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder') || 'Buscar por nombre de cliente o email...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-xs"
            />
          </div>
        </div>

        <TableProjectsView
          projects={filteredProjects}
          getProjects={getProjects}
          deleteProject={deleteProject}
          updateProjectStatus={updateProjectStatus}
          isLoading={isLoading}
        />
    </div>
  )
}
