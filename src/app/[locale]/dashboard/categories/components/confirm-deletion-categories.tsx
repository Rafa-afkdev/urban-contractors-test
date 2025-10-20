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
import { Categorias } from "../../../../../../interfaces/categories.interface";
import { useTranslations } from "next-intl";



  export function ConfirmDeletion({children, deleteCategorie, categorie}: {children: React.ReactNode, deleteCategorie: (categorie: Categorias) => Promise<void>; categorie: Categorias }) {
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
            onClick={() => deleteCategorie(categorie)}
            >
            {t('confirm')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  