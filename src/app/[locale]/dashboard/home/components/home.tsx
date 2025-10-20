"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCollection } from '@/lib/firebase';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, Calendar, Clock, CheckCircle2, Wrench, MapPin, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Project } from '../../../../../../interfaces/projects.interface';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  canceledProjects: number;
  totalRevenue: number;
  pendingAppointments: number;
  totalServices: number;
  mostRequestedService: { name: string; count: number };
  monthlyRevenue: { month: string; amount: number }[];
  recentProjects: Project[];
  projectsByStatus: { status: string; count: number; percentage: number }[];
}

export default function Home() {
  const t = useTranslations('Dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    canceledProjects: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    totalServices: 0,
    mostRequestedService: { name: 'N/A', count: 0 },
    monthlyRevenue: [],
    recentProjects: [],
    projectsByStatus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Obtener proyectos
      const projects = await getCollection('proyectos') as Project[];
      
      // Obtener citas y filtrar solo las pendientes
      const appointments = await getCollection('citas_agendadas');
      const pendingAppointmentsCount = Array.isArray(appointments)
        ? appointments.filter((a: any) => (a?.status ?? a?.estado) === 'PENDIENTE').length
        : 0;

      // Obtener servicios del catálogo
      const catalogServices = await getCollection('catalogos');

      // Calcular estadísticas
      const activeProjects = projects.filter(p => p.status === 'EN_PROCESO').length;
      const completedProjects = projects.filter(p => p.status === 'COMPLETADO').length;
      const canceledProjects = projects.filter(p => p.status === 'CANCELADO').length;
      
      // Calcular ingresos totales
      const totalRevenue = projects
        .filter(p => p.status === 'COMPLETADO')
        .reduce((sum, p) => sum + (p.total_proyecto || 0), 0);

      // Total de servicios registrados (desde la colección catalogos)
      const totalServices = Array.isArray(catalogServices) ? catalogServices.length : 0;

      // Encontrar servicio más solicitado
      const serviceCount: { [key: string]: number } = {};
      projects.forEach(project => {
        project.servicios?.forEach(service => {
          const serviceName = service.nombre_servicio;
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });
      });

      const mostRequested = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0];
      const mostRequestedService = mostRequested 
        ? { name: mostRequested[0], count: mostRequested[1] }
        : { name: 'N/A', count: 0 };

      // Proyectos recientes (últimos 5)
      const recentProjects = projects
        .sort((a, b) => {
          const dateA = a.createdAt || a.created_at;
          const dateB = b.createdAt || b.created_at;
          if (!dateA || !dateB) return 0;
          return (dateB as any).seconds - (dateA as any).seconds;
        })
        .slice(0, 5);

      // Calcular ingresos mensuales (últimos 6 meses)
      const monthlyRevenue = calculateMonthlyRevenue(projects);

      // Estadísticas por estado
      const total = projects.length || 1;
      const projectsByStatus = [
        { 
          status: 'EN_PROCESO', 
          count: activeProjects, 
          percentage: Math.round((activeProjects / total) * 100) 
        },
        { 
          status: 'COMPLETADO', 
          count: completedProjects, 
          percentage: Math.round((completedProjects / total) * 100) 
        },
        { 
          status: 'CANCELADO', 
          count: canceledProjects, 
          percentage: Math.round((canceledProjects / total) * 100) 
        }
      ];

      setStats({
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        canceledProjects,
        totalRevenue,
        pendingAppointments: pendingAppointmentsCount,
        totalServices,
        mostRequestedService,
        monthlyRevenue,
        recentProjects,
        projectsByStatus
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (projects: Project[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyData: { month: string; amount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      
      const monthRevenue = projects
        .filter(p => {
          const projectDate = p.createdAt || p.created_at;
          if (!projectDate) return false;
          const pDate = new Date((projectDate as any).seconds * 1000);
          return pDate.getMonth() === date.getMonth() && 
                 pDate.getFullYear() === date.getFullYear() &&
                 p.status === 'COMPLETADO';
        })
        .reduce((sum, p) => sum + (p.total_proyecto || 0), 0);

      monthlyData.push({ month: monthName, amount: monthRevenue });
    }

    return monthlyData;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EN_PROCESO":
        return <Badge className="bg-blue-500">En Proceso</Badge>;
      case "COMPLETADO":
        return <Badge className="bg-green-500">Completado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Si es un string ISO (como "2025-10-19T05:26:06.996Z")
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    
    // Si es un Timestamp de Firebase
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    
    // Si ya es un objeto Date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-2 pt-2 md:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('welcomeMessage')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('stats.totalProjects')}
              </CardTitle>
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalProjects}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {stats.activeProjects} {t('stats.active')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Services */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('stats.totalServices')}
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalServices}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('stats.services')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Most Requested Service */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('stats.mostRequested')}
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {stats.mostRequestedService.name}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                {stats.mostRequestedService.count} {t('stats.requests')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('stats.totalRevenue')}
              </CardTitle>
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {t('stats.fromCompleted')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects and Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card className="lg:col-span-2 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              {t('stats.recentProjects')}
            </CardTitle>
            <CardDescription>{t('stats.recentlyRegistered')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentProjects.length > 0 ? (
                stats.recentProjects.map((project, index) => (
                  <HoverCard key={project.id || index}>
                    <HoverCardTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            project.status === 'EN_PROCESO' ? 'bg-blue-100 dark:bg-blue-900' :
                            project.status === 'COMPLETADO' ? 'bg-green-100 dark:bg-green-900' :
                            'bg-red-100 dark:bg-red-900'
                          }`}>
                            <Users className={`w-5 h-5 ${
                              project.status === 'EN_PROCESO' ? 'text-blue-600 dark:text-blue-400' :
                              project.status === 'COMPLETADO' ? 'text-green-600 dark:text-green-400' :
                              'text-red-600 dark:text-red-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {project.cliente_nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {project.servicios?.length || 0} {t('stats.services')} • {formatDate(project.fecha_inicio || project.createdAt || project.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(project.total_proyecto || 0)}
                            </p>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-96" align="start">
                      <div className="space-y-3">
                        {/* Header del proyecto */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {project.cliente_nombre}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('stats.project')} #{project.id?.slice(-6)}
                            </p>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>

                        {/* Información de contacto */}
                        <div className="space-y-2 border-t pt-2">
                          {project.cliente_email && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{project.cliente_email}</span>
                            </div>
                          )}
                          {project.cliente_telefono && (
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{project.cliente_telefono}</span>
                            </div>
                          )}
                          {project.cliente_direccion && (
                            <div className="flex items-center gap-2 text-xs">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{project.cliente_direccion}</span>
                            </div>
                          )}
                        </div>

                        {/* Servicios */}
                        <div className="border-t pt-2">
                          <div className="flex items-center gap-1 mb-2">
                            <Wrench className="w-3 h-3 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {t('stats.services')} ({project.servicios?.length || 0})
                            </span>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {project.servicios?.map((servicio, idx) => (
                              <div key={idx} className="flex justify-between items-start text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {servicio.nombre_servicio}
                                  </p>
                                  {servicio.descripcion_trabajo && (
                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                      {servicio.descripcion_trabajo}
                                    </p>
                                  )}
                                </div>
                                <span className="font-semibold text-orange-600 ml-2">
                                  ${servicio.total_servicio?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total y trabajador */}
                        <div className="border-t pt-2 flex justify-between items-center">
                          <div>
                            {project.trabajador_nombre && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('stats.worker')}: {project.trabajador_nombre}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('stats.total')}</p>
                            <p className="text-lg font-bold text-orange-600">
                              {formatCurrency(project.total_proyecto || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {t('stats.noRecentProjects')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              {t('stats.projectStatus')}
            </CardTitle>
            <CardDescription>{t('stats.statusDistribution')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.projectsByStatus.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.status === 'EN_PROCESO' ? t('stats.inProgress') : 
                     item.status === 'COMPLETADO' ? t('stats.completed') : t('stats.canceledProjects')}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      item.status === 'EN_PROCESO' ? 'bg-blue-600' :
                      item.status === 'COMPLETADO' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.percentage}% {t('stats.ofTotal')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingAppointments}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.pendingAppointments')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.canceledProjects}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.canceledProjects')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue / (stats.completedProjects || 1))}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.averageRevenue')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
