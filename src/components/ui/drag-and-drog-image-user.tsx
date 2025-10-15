/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Dropzone, ExtFile, FileMosaic, FileMosaicProps } from "@files-ui/react";
import * as React from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToBase64 } from "../../../actions/convert-file-to-base64";
import { useTranslations } from "next-intl";

export default function DragAndDropImageUser({
  handleImage,
  initialImage = "",
}: {
  handleImage: (url: string) => void;
  initialImage?: string;
}) {
      const t = useTranslations('DragAndDropImageUser');
  const [files, setFiles] = React.useState<ExtFile[]>([]);
  const [previewImage, setPreviewImage] = React.useState<string>(initialImage);

  // Initialize with existing image if available
  React.useEffect(() => {
    if (initialImage) {
      setPreviewImage(initialImage);
      // Create a dummy file with the initial image to show in the FileMosaic
      const dummyFile: ExtFile = {
        id: "initial-image",
        name: "patient-image.jpg",
        size: 0,
        valid: true,
        type: "image/jpeg",
      };
      setFiles([dummyFile]);
    } else {
      setPreviewImage("");
      setFiles([]);
    }
  }, [initialImage]);

  const updateFiles = async (incomingFiles: ExtFile[]) => {
    if (incomingFiles && incomingFiles.length > 0) {
      const file = incomingFiles[0].file as File;
      const base64 = await fileToBase64(file);
      handleImage(base64);
      setPreviewImage(base64);
      setFiles(incomingFiles);
    }
  };

  const removeFile = (id: FileMosaicProps["id"]) => {
    handleImage("");
    setPreviewImage("");
    setFiles([]);
  };

  return (
    <div className="w-full">
      {previewImage ? (
        <div className="mb-2 flex flex-col items-center gap-2">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#2FABDF] dark:border-sky-400">
            <Image
              src={previewImage}
              alt="employee-image"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => removeFile("initial-image")}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ) : (
        <Dropzone
          onChange={updateFiles}
          value={files}
          header={false}
          footer={false}
          label={t('label')}
          accept=".webp,.png,.jpg,.jpeg/*"
          maxFiles={1}
          minHeight="50px"
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 cursor-pointer hover:border-[#2FABDF] dark:hover:border-sky-400 transition-colors dark:bg-gray-800/50"
        >
          {files.map((file) => (
            <FileMosaic
              key={file.id}
              {...file}
              onDelete={removeFile}
              preview
              resultOnTooltip
              alwaysActive
            />
          ))}
        </Dropzone>
      )}
    </div>
  );
}