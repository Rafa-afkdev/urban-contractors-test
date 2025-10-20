# Instrucciones para Completar el Componente de Proyectos

## Cambios Realizados Hasta Ahora:
✅ Interfaces actualizadas en `projects.interface.ts`
✅ Imports agregados (Checkbox, LaborCost, CatalogoProductosRequeridos)
✅ Estados nuevos agregados (laborCosts, selectedAppointmentData, totalProyecto)

## Cambios Pendientes en `create-update-project.tsx`:

### 1. Agregar useEffect para cargar costos de mano de obra (después de línea 90):

```typescript
// Cargar costos de mano de obra
useEffect(() => {
  const fetchLaborCosts = async () => {
    try {
      const res = (await getCollection('costos_mano_obra')) as LaborCost[];
      setLaborCosts(res);
    } catch (error) {
      console.error('Error loading labor costs:', error);
    }
  };
  fetchLaborCosts();
}, []);
```

### 2. Agregar useEffect para calcular totales (después del useEffect anterior):

```typescript
// Calcular totales cuando cambian los servicios
useEffect(() => {
  const total = projectServices.reduce((sum, servicio) => sum + (servicio.total_servicio || 0), 0);
  setTotalProyecto(total);
}, [projectServices]);
```

### 3. Actualizar useEffect de projectToUpdate (línea 92-102):

```typescript
useEffect(() => {
  if (projectToUpdate) {
    form.setValue("id_cita", projectToUpdate.id_cita || "");
    form.setValue("status", projectToUpdate.status || "EN_PROCESO");
    form.setValue("notas", projectToUpdate.notas || "");
    setSelectedAppointment(projectToUpdate.id_cita || "");
    setProjectServices(projectToUpdate.servicios || []);
  } else {
    form.reset();
    setSelectedAppointment("");
    setSelectedAppointmentData(null);
    setProjectServices([]);
  }
}, [projectToUpdate, open, form]);
```

### 4. Reemplazar función `agregarServicio` (línea 104-112):

```typescript
const agregarServicio = () => {
  setProjectServices([...projectServices, {
    id_servicio: "",
    nombre_servicio: "",
    descripcion_servicio: "",
    precio_base: 0,
    descripcion_trabajo: "",
    usa_pie_lineal: false,
    usa_pie_cuadrado: false,
    pie_lineal: 0,
    pie_cuadrado: 0,
    costo_mano_obra: 0,
    subtotal_servicio: 0,
    subtotal_materiales: 0,
    total_servicio: 0,
    nota_servicio: ""
  }]);
};
```

### 5. Reemplazar función `actualizarServicio` (línea 118-130):

```typescript
const actualizarServicio = (index: number, field: keyof ProjectService, value: any) => {
  const nuevosServicios = [...projectServices];
  
  if (field === 'id_servicio') {
    const selectedService = services.find(s => s.id === value);
    if (selectedService) {
      // Buscar costo de mano de obra
      const laborCost = laborCosts.find(lc => lc.id_servicio === value);
      
      nuevosServicios[index] = {
        ...nuevosServicios[index],
        id_servicio: value as string,
        nombre_servicio: selectedService.nombre || "",
        descripcion_servicio: selectedService.descripcion || "",
        precio_base: Number(selectedService.precio) || 0,
        costo_mano_obra: laborCost?.costo_mano_obra || 0
      };
    }
  } else {
    nuevosServicios[index] = { ...nuevosServicios[index], [field]: value };
  }
  
  // Recalcular totales del servicio
  const servicio = nuevosServicios[index];
  const medida = servicio.usa_pie_lineal ? (servicio.pie_lineal || 0) : 
                 servicio.usa_pie_cuadrado ? (servicio.pie_cuadrado || 0) : 0;
  
  // Calcular subtotal del servicio (precio base * medida)
  servicio.subtotal_servicio = servicio.precio_base * medida;
  
  // Calcular subtotal de materiales
  const selectedService = services.find(s => s.id === servicio.id_servicio);
  let subtotalMateriales = 0;
  if (selectedService?.productos_requeridos) {
    selectedService.productos_requeridos.forEach((producto: CatalogoProductosRequeridos) => {
      subtotalMateriales += (producto.cantidad || 0) * medida;
    });
  }
  servicio.subtotal_materiales = subtotalMateriales;
  
  // Calcular total del servicio (servicio + materiales + mano de obra * medida)
  servicio.total_servicio = servicio.subtotal_servicio + servicio.subtotal_materiales + ((servicio.costo_mano_obra || 0) * medida);
  
  setProjectServices(nuevosServicios);
};
```

### 6. Actualizar función `onSubmit` para incluir total_proyecto (línea 155-166):

```typescript
const onSubmit = async (data: z.infer<typeof formSchema>) => {
  if (projectServices.length === 0) {
    showToast.error(t('validation.servicesRequired'), {
      duration: 2500,
      progress: true,
      position: "top-center",
      transition: "bounceIn",
      icon: "",
      sound: true,
    });
    return;
  }

  const projectData = {
    ...data,
    servicios: projectServices,
    total_proyecto: totalProyecto
  };

  if (projectToUpdate) {
    UpdateProject(projectData);
  } else {
    CreateProject(projectData);
  }
};
```

### 7. Actualizar función `CreateProject` para incluir dirección completa (línea 168-192):

```typescript
const CreateProject = async (projectData: any) => {
  const path = `proyectos`;
  setIsLoading(true);
  try {
    const normalizedProject = {
      ...projectData,
      cliente_nombre: selectedAppointmentData ? `${selectedAppointmentData.nombre} ${selectedAppointmentData.apellido}` : "",
      cliente_email: selectedAppointmentData?.email || "",
      cliente_telefono: selectedAppointmentData?.telefono || "",
      cliente_direccion: selectedAppointmentData ? `${selectedAppointmentData.direccion}, ${selectedAppointmentData.ciudad}, ${selectedAppointmentData.estado}, ${selectedAppointmentData.codigo_postal}` : "",
      fecha_inicio: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await addDocument(path, normalizedProject);
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
    setSelectedAppointment("");
    setSelectedAppointmentData(null);
    setProjectServices([]);
    getProjects();
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
```

### 8. Actualizar función `UpdateProject` (línea 194-217):

```typescript
const UpdateProject = async (projectData: any) => {
  const path = `proyectos/${projectToUpdate?.id}`;
  setIsLoading(true);
  try {
    const normalizedProject = {
      ...projectData,
      updated_at: new Date().toISOString(),
    };

    await updateDocument(path, normalizedProject);
    showToast.success(t('successUpdate'), {
      duration: 4000,
      progress: true,
      position: "top-center",
      transition: "bounceIn",
      icon: "",
      sound: true,
    });
    getProjects();
    setOpen(false);
    form.reset();
    setSelectedAppointment("");
    setSelectedAppointmentData(null);
    setProjectServices([]);
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
```

## Continúa en el siguiente archivo...
