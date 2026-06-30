// src\components\Page\Configuration\ExpenseSources\Page.tsx

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createColumns } from "./columns";
import { DataTable } from "@/components/utils/DataTable";
import { DialogAddEditExpenseSource } from "./DialogAddEditExpenseSource";
import { fetchDeleteFuenteGastos } from "@/lib/fetch/fuentesGastos";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useFuentesGastos } from "@/hooks/useFuentesGastos";
import { useId, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AlertAction from "@/components/utils/AlertAction";
import type { BtnAlertActionConfig } from "@/components/utils/AlertAction";
import type { FuenteGastosDB } from "@/types/fuentesGastos";

export const ExpenseSourcesPage = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const { data, isFetching } = useFuentesGastos({ user });

  const [ sorting ] = useState([{
    id: 'nombre',
    desc: false
  }]);

  const [ isOpenAddEditDialog, setIsOpenAddEditDialog ] = useState<{ status: boolean, source: FuenteGastosDB | undefined }>({ status: false, source: undefined });
  const [ isDeleteOpen, setIsDeleteOpen ] = useState({ status: false, id: "" });

  const handleEdit = (source: FuenteGastosDB) => {
    setIsOpenAddEditDialog({ status: true, source });
  }

  const handleDelete = (source: FuenteGastosDB) => {
    setIsDeleteOpen({ status: true, id: source._id });
  }

  const configBtnAcceptDelete: BtnAlertActionConfig = {
    onClick: async () => {
      const token = await getAccessTokenSilently();
      const id = isDeleteOpen.id;
      if (!id || !token) return;

      const fuente = data?.find(item => item._id === id);
      if (!fuente) return;

      toast.loading('Espere...', { id: toastId });
      const response = await fetchDeleteFuenteGastos({ id, token });

      if (response.statusCode === 409) {
        toast.error('No se puede eliminar la fuente de gasto porque tiene gastos asociados', { id: toastId });
        return;
      }

      if (response.statusCode != 200) {
        toast.error('Error al eliminar la fuente de gasto', { id: toastId });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['fuentes-gastos'] });
      toast.success('Fuente de gasto eliminada correctamente', { id: toastId });
    }
  };

  const columns = useMemo(() => createColumns({ handleEdit, handleDelete, isFetching }), [isFetching]);

  const ButtonAddSource = <Button onClick={() => setIsOpenAddEditDialog({ status: true, source: undefined })} className="cursor-pointer" disabled={isFetching}>Agregar</Button>

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Fuentes de gastos</h1>

      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Aquí puedes gestionar tus fuentes de gastos
      </p>

      <Card className='p-4 bg-card rounded-xl shadow-md'>
        <DataTable columns={columns} data={data} dataLoading={isFetching} toolbarActions={[ButtonAddSource]} sorting={sorting} />
      </Card>

      {
        isOpenAddEditDialog.status && <DialogAddEditExpenseSource isOpen={isOpenAddEditDialog} setIsOpen={setIsOpenAddEditDialog} actualSources={data || []} />
      }
      {
        isDeleteOpen.status && <AlertAction isOpen={isDeleteOpen.status} onOpenChange={open => setIsDeleteOpen({ status: open, id: isDeleteOpen.id })} title="¿Estás seguro de que deseas eliminar esta fuente de gastos?" configBtnAccept={configBtnAcceptDelete} />
      }
    </section>
  );
}
