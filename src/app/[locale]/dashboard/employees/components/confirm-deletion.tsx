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
import { useTranslations } from "next-intl";
import { Employees } from "../../../../../../interfaces/employees.interface";



  export function ConfirmDeletionEmployee({children, deleteEmployee, employee}: {children: React.ReactNode, deleteEmployee: (employee: Employees) => Promise<void>; employee: Employees }) {
    const t = useTranslations('ConfirmDeletionEmployee');
    
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
            onClick={() => deleteEmployee(employee)}
            >
            {t('confirm')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
