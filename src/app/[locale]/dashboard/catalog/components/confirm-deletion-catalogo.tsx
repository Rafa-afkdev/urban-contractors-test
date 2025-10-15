import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Catalog } from "../../../../../../interfaces/calalog.interface";
import { useTranslations } from "next-intl";



  export function ConfirmDeletion({children, deleteCatalog, catalog}: {children: React.ReactNode, deleteCatalog: (catalog: Catalog) => Promise<void>; catalog: Catalog }) {
    const t = useTranslations('ConfirmDeletion');
    
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
        {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600"
            onClick={() => deleteCatalog(catalog)}
            >
            {t('confirm')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  