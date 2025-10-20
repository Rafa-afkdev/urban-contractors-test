# Instrucciones para UI del Formulario - Parte 2

## Cambios en el JSX del Dialog (después de línea 250):

### 1. Actualizar el PopoverTrigger del combobox de citas para guardar selectedAppointmentData:

Buscar la línea donde está:
```typescript
onSelect={() => {
  const newValue = appointment.id === selectedAppointment ? "" : appointment.id || "";
  setSelectedAppointment(newValue);
  setValue("id_cita", newValue);
  setOpenAppointmentCombobox(false);
}}
```

Reemplazar por:
```typescript
onSelect={() => {
  const newValue = appointment.id === selectedAppointment ? "" : appointment.id || "";
  setSelectedAppointment(newValue);
  setSelectedAppointmentData(appointment);
  setValue("id_cita", newValue);
  setOpenAppointmentCombobox(false);
}}
```

### 2. Agregar Card con información del cliente (después del combobox de citas, antes del Select de status):

```tsx
{/* Mostrar Dirección del Cliente */}
{selectedAppointmentData && (
  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
    <CardContent className="pt-4">
      <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">{t('clientAddress')}</h4>
      <p className="text-sm text-blue-800 dark:text-blue-200">
        {selectedAppointmentData.direccion}
        {selectedAppointmentData.direccion2 && `, ${selectedAppointmentData.direccion2}`}
        <br />
        {selectedAppointmentData.ciudad}, {selectedAppointmentData.estado} {selectedAppointmentData.codigo_postal}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
        <div>
          <span className="font-medium text-blue-900 dark:text-blue-100">{t('clientPhone')}:</span>
          <span className="ml-2 text-blue-800 dark:text-blue-200">{selectedAppointmentData.telefono}</span>
        </div>
        <div>
          <span className="font-medium text-blue-900 dark:text-blue-100">{t('clientEmail')}:</span>
          <span className="ml-2 text-blue-800 dark:text-blue-200">{selectedAppointmentData.email}</span>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

### 3. Reemplazar completamente el map de servicios (projectServices.map):

```tsx
{projectServices.map((service, index) => {
  const selectedServiceData = services.find(s => s.id === service.id_servicio);
  
  return (
    <Card key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">{t('service')} {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => eliminarServicio(index)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Combobox para Seleccionar Servicio */}
        <div className="space-y-1">
          <Label>{t('serviceName')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {service.id_servicio
                  ? services.find((s) => s.id === service.id_servicio)?.nombre
                  : t('serviceNamePlaceholder')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder={t('serviceSearch')} className="h-9" />
                <CommandList>
                  <CommandEmpty>{t('serviceNotFound')}</CommandEmpty>
                  <CommandGroup>
                    {services.map((s) => (
                      <CommandItem
                        key={s.id}
                        value={s.nombre}
                        onSelect={() => {
                          actualizarServicio(index, 'id_servicio', s.id || "");
                        }}
                      >
                        {s.nombre}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            service.id_servicio === s.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Mostrar Precio Base y Descripción del Servicio */}
        {service.id_servicio && selectedServiceData && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('basePrice')}:</span>
                  <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                    ${selectedServiceData.precio}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('laborCost')}:</span>
                  <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
                    ${service.costo_mano_obra || 0}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('serviceDescription')}:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedServiceData.descripcion}
                </p>
              </div>
              {selectedServiceData.productos_requeridos && selectedServiceData.productos_requeridos.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('requiredMaterials')}:</span>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedServiceData.productos_requeridos.map((prod: CatalogoProductosRequeridos, idx: number) => (
                      <li key={idx}>
                        {prod.nombre} - {prod.cantidad} {prod.tipo_medida}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Descripción del Trabajo */}
        <div className="space-y-1">
          <Label>{t('workDescription')}</Label>
          <Input
            value={service.descripcion_trabajo || ''}
            onChange={(e) => actualizarServicio(index, 'descripcion_trabajo', e.target.value)}
            placeholder={t('workDescriptionPlaceholder')}
          />
        </div>

        {/* Checkboxes para Tipo de Medida */}
        <div className="space-y-2">
          <Label>{t('measurementType')}</Label>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`lineal-${index}`}
                checked={service.usa_pie_lineal}
                onCheckedChange={(checked) => {
                  actualizarServicio(index, 'usa_pie_lineal', checked);
                  if (checked) actualizarServicio(index, 'usa_pie_cuadrado', false);
                }}
              />
              <label
                htmlFor={`lineal-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('linearFeet')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`cuadrado-${index}`}
                checked={service.usa_pie_cuadrado}
                onCheckedChange={(checked) => {
                  actualizarServicio(index, 'usa_pie_cuadrado', checked);
                  if (checked) actualizarServicio(index, 'usa_pie_lineal', false);
                }}
              />
              <label
                htmlFor={`cuadrado-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('squareFeet')}
              </label>
            </div>
          </div>
        </div>

        {/* Input de Medidas */}
        {service.usa_pie_lineal && (
          <div className="space-y-1">
            <Label>{t('linearFeet')}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={service.pie_lineal || ''}
              onChange={(e) => actualizarServicio(index, 'pie_lineal', parseFloat(e.target.value) || 0)}
              placeholder={t('linearFeetPlaceholder')}
            />
          </div>
        )}

        {service.usa_pie_cuadrado && (
          <div className="space-y-1">
            <Label>{t('squareFeet')}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={service.pie_cuadrado || ''}
              onChange={(e) => actualizarServicio(index, 'pie_cuadrado', parseFloat(e.target.value) || 0)}
              placeholder={t('squareFeetPlaceholder')}
            />
          </div>
        )}

        {/* Nota del Servicio */}
        <div className="space-y-1">
          <Label>{t('serviceNote')}</Label>
          <Textarea
            value={service.nota_servicio || ''}
            onChange={(e) => actualizarServicio(index, 'nota_servicio', e.target.value)}
            placeholder={t('serviceNotePlaceholder')}
            rows={2}
          />
        </div>

        {/* Totales del Servicio */}
        {service.id_servicio && (service.usa_pie_lineal || service.usa_pie_cuadrado) && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-4">
              <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('serviceTotals')}</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('serviceSubtotal')}:</span>
                  <span className="ml-2 font-medium">${service.subtotal_servicio?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('materialsSubtotal')}:</span>
                  <span className="ml-2 font-medium">${service.subtotal_materiales?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('laborCostTotal')}:</span>
                  <span className="ml-2 font-medium">
                    ${((service.costo_mano_obra || 0) * (service.usa_pie_lineal ? (service.pie_lineal || 0) : (service.pie_cuadrado || 0))).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <span className="text-gray-800 dark:text-gray-200 font-semibold">{t('serviceTotal')}:</span>
                  <span className="ml-2 font-bold text-green-600 dark:text-green-400 text-lg">
                    ${service.total_servicio?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Card>
  );
})}
```

### 4. Agregar Card con Total del Proyecto (después del map de servicios, antes de Notas):

```tsx
{/* Total del Proyecto */}
{projectServices.length > 0 && (
  <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-300 dark:border-orange-700 shadow-lg">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('projectTotal')}:</h3>
        <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
          ${totalProyecto.toFixed(2)}
        </span>
      </div>
    </CardContent>
  </Card>
)}
```

## Traducciones a Agregar:

### En `messages/es.json` (dentro de CreateUpdateProject):

```json
"clientAddress": "Dirección del Cliente",
"clientPhone": "Teléfono",
"clientEmail": "Email",
"basePrice": "Precio Base",
"laborCost": "Costo Mano de Obra",
"serviceDescription": "Descripción del Servicio",
"requiredMaterials": "Materiales Requeridos",
"workDescription": "Descripción del Trabajo",
"workDescriptionPlaceholder": "Ej: Remodelación de sala",
"measurementType": "Tipo de Medida",
"serviceNote": "Nota del Servicio",
"serviceNotePlaceholder": "Ingrese notas adicionales para este servicio",
"serviceTotals": "Totales del Servicio",
"serviceSubtotal": "Subtotal Servicio",
"materialsSubtotal": "Subtotal Materiales",
"laborCostTotal": "Costo Mano de Obra",
"serviceTotal": "Total Servicio",
"projectTotal": "Total del Proyecto",
"serviceSearch": "Buscar servicio..."
```

### En `messages/en.json` (dentro de CreateUpdateProject):

```json
"clientAddress": "Client Address",
"clientPhone": "Phone",
"clientEmail": "Email",
"basePrice": "Base Price",
"laborCost": "Labor Cost",
"serviceDescription": "Service Description",
"requiredMaterials": "Required Materials",
"workDescription": "Work Description",
"workDescriptionPlaceholder": "E.g: Living room remodeling",
"measurementType": "Measurement Type",
"serviceNote": "Service Note",
"serviceNotePlaceholder": "Enter additional notes for this service",
"serviceTotals": "Service Totals",
"serviceSubtotal": "Service Subtotal",
"materialsSubtotal": "Materials Subtotal",
"laborCostTotal": "Labor Cost",
"serviceTotal": "Service Total",
"projectTotal": "Project Total",
"serviceSearch": "Search service..."
```

## Resumen de Funcionalidades Implementadas:

✅ Selección de cliente muestra dirección completa
✅ Combobox para buscar y seleccionar servicios
✅ Muestra precio base y descripción del servicio
✅ Muestra costo de mano de obra automáticamente
✅ Muestra materiales requeridos
✅ Campo para descripción del trabajo (Ej: "Remodelación de sala")
✅ Checkboxes para seleccionar pie lineal o pie cuadrado
✅ Cálculo automático: precio base × medida
✅ Cálculo automático: materiales × medida
✅ Cálculo automático: mano de obra × medida
✅ Subtotales por servicio
✅ Total general del proyecto
✅ Campo de nota por servicio
