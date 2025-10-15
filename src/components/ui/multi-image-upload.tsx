"use client";

import * as React from "react";
import Image from "next/image";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToBase64 } from "../../../actions/convert-file-to-base64";
import { Dropzone, ExtFile, FileMosaic } from "@files-ui/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
  handleImages: (urls: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
  className?: string;
}

export default function MultiImageUpload({
  handleImages,
  initialImages = [],
  maxImages = 5,
  className
}: MultiImageUploadProps) {
  const t = useTranslations('DragAndDropImage');
  const [images, setImages] = React.useState<string[]>(initialImages);
  const [files, setFiles] = React.useState<ExtFile[]>([]);

  // Initialize with existing images if available
  React.useEffect(() => {
    if (initialImages.length > 0) {
      setImages(initialImages);
      // Create dummy files for existing images
      const dummyFiles: ExtFile[] = initialImages.map((img, index) => ({
        id: `initial-image-${index}`,
        name: `image-${index + 1}.jpg`,
        size: 0,
        valid: true,
        type: "image/jpeg",
      }));
      setFiles(dummyFiles);
    } else {
      setImages([]);
      setFiles([]);
    }
  }, [initialImages]);

  const updateFiles = async (incomingFiles: ExtFile[]) => {
    const newImages: string[] = [];
    
    for (const extFile of incomingFiles) {
      if (extFile.file) {
        const base64 = await fileToBase64(extFile.file as File);
        newImages.push(base64);
      }
    }

    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    setImages(updatedImages);
    handleImages(updatedImages);
    setFiles(incomingFiles);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    handleImages(updatedImages);
    
    // Update files array
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Grid de imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                
                {/* Botón de eliminar */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
              
              {/* Número de imagen */}
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
          
          {/* Botón para agregar más imágenes */}
          {canAddMore && (
            <div className="relative aspect-square">
              <Dropzone
                onChange={updateFiles}
                value={[]}
                header={false}
                footer={false}
                label=""
                accept=".webp,.png,.jpg,.jpeg/*"
                maxFiles={maxImages - images.length}
                minHeight="100%"
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors h-full flex items-center justify-center"
              >
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="text-xs text-center">Agregar</span>
                </div>
              </Dropzone>
            </div>
          )}
        </div>
      )}

      {/* Dropzone inicial cuando no hay imágenes */}
      {images.length === 0 && (
        <Dropzone
          onChange={updateFiles}
          value={files}
          header={false}
          footer={false}
          label={t('label')}
          accept=".webp,.png,.jpg,.jpeg/*"
          maxFiles={maxImages}
          minHeight="120px"
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
        >
          <div className="text-center">
            <Plus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Máximo {maxImages} imágenes
            </p>
          </div>
        </Dropzone>
      )}

      {/* Información adicional */}
      {images.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>{images.length} de {maxImages} imágenes</span>
          {canAddMore && (
            <span className="text-xs">Puedes agregar {maxImages - images.length} más</span>
          )}
        </div>
      )}
    </div>
  );
}
