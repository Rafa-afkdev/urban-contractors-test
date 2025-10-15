declare module '@files-ui/react' {
  import * as React from 'react';

  export interface ExtFile {
    id?: string | number;
    name?: string;
    size?: number;
    valid?: boolean;
    type?: string;
    file?: File | null;
  }

  export interface FileMosaicProps {
    id?: string | number;
    onDelete?: (id: string | number) => void;
  }

  export interface DropzoneProps {
    onChange: (files: ExtFile[]) => void;
    value: ExtFile[];
    header?: boolean;
    footer?: boolean;
    label?: string;
    accept?: string;
    maxFiles?: number;
    minHeight?: string | number;
    className?: string;
    children?: React.ReactNode;
  }

  export const Dropzone: React.FC<DropzoneProps>;

  export interface FileMosaicExtraProps {
    onDelete?: (id: FileMosaicProps['id']) => void;
    preview?: boolean;
    resultOnTooltip?: boolean;
    alwaysActive?: boolean;
  }

  export const FileMosaic: React.FC<ExtFile & FileMosaicProps & FileMosaicExtraProps>;
}
