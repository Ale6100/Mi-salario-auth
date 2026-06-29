// src\components\Page\Configuration\IncomeSources\Page.tsx

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createColumns } from "./columns";
import { DataTable } from "@/components/utils/DataTable";
import { DialogAddEditIncomeSource } from "./DialogAddEditIncomeSource";
import { fetchDeleteFuenteIngresos } from "@/lib/fetch/fuentesIngresos";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useFuentesIngresos } from "@/hooks/useFuentesIngresos";
import { useId, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AlertAction, { type BtnAlertActionConfig } from "@/components/utils/AlertAction";
import type { FuenteIngresosDB } from "@/types/fuentesIngresos";

export const IncomeSourcesPage = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const { data, isFetching } = useFuentesIngresos({ user });

  const [ sorting ] = useState([{
    id: 'activo',
    desc: true
  }]);

  const [ isOpenAddEditDialog, setIsOpenAddEditDialog ] = useState<{ status: boolean, source: FuenteIngresosDB | undefined }>({ status: false, source: undefined });
  const [ isDeleteOpen, setIsDeleteOpen ] = useState({ status: false, id: "" });

  const handleEdit = (source: FuenteIngresosDB) => {
    setIsOpenAddEditDialog({ status: true, source });
  }

  const handleDelete = (source: FuenteIngresosDB) => {
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
      const response = await fetchDeleteFuenteIngresos({ id, token });

      if (response.statusCode === 409) {
        toast.error('No se puede eliminar la fuente de ingreso porque tiene ingresos asociados', { id: toastId });
        return;
      }

      if (response.statusCode != 200) {
        toast.error('Error al eliminar la fuente de ingreso', { id: toastId });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['fuentes-ingreso'] });
      toast.success("Fuente de ingreso eliminada correctamente", { id: toastId });
    }
  }

  const columns = useMemo(() => createColumns({ handleEdit, handleDelete, isFetching }), [isFetching]);

  const ButtonAddSource = <Button onClick={() => setIsOpenAddEditDialog({ status: true, source: undefined })} className="cursor-pointer" disabled={isFetching}>Agregar</Button>

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Fuentes de Ingreso</h1>

      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Aquí puedes gestionar tus fuentes de ingreso
      </p>

      <Card className='p-4 bg-card rounded-xl shadow-md'>
        <DataTable columns={columns} data={data} dataLoading={isFetching} toolbarActions={[ButtonAddSource]} sorting={sorting} columnsHidden={['activo']} />
      </Card>

      {
        isOpenAddEditDialog.status && <DialogAddEditIncomeSource isOpen={isOpenAddEditDialog} setIsOpen={setIsOpenAddEditDialog} actualSources={data || []} />
      }
      {
        isDeleteOpen.status && <AlertAction isOpen={isDeleteOpen.status} onOpenChange={open => setIsDeleteOpen({ status: open, id: isDeleteOpen.id })} title="¿Estás seguro de que deseas eliminar esta fuente de ingreso?" configBtnAccept={configBtnAcceptDelete} />
      }
    </section>
  )
}
