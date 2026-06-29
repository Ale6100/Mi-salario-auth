// src\components\Page\Income\Page.tsx

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createColumns } from "./columns";
import { DataTable } from "@/components/utils/DataTable";
import { DialogAddEditIncome } from "./DialogAddEditIncome";
import { fetchDeleteConceptoIngresos } from "@/lib/fetch/conceptosIngresos";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useFuentesIngresos } from "@/hooks/useFuentesIngresos";
import { useId, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AlertAction from "@/components/utils/AlertAction";
import type { BtnAlertActionConfig } from "@/components/utils/AlertAction";
import type { ConceptoIngresosDB } from "@/types/conceptosIngresos";

export const IncomePage = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const { data, isFetching } = useConceptosIngresos({ user });
  const { data: fuentesData, isFetching: isFetchingFuentes } = useFuentesIngresos({ user });

  const [ sorting ] = useState([
    {
      id: 'periodo',
      desc: true,
    }
  ]);

  const [ isOpenAddEditDialog, setIsOpenAddEditDialog ] = useState<{ status: boolean, income: ConceptoIngresosDB | undefined }>({ status: false, income: undefined });
  const [ isDeleteOpen, setIsDeleteOpen ] = useState({ status: false, id: "" });

  const handleEdit = (income: ConceptoIngresosDB) => {
    setIsOpenAddEditDialog({ status: true, income });
  }

  const handleDelete = (income: ConceptoIngresosDB) => {
    setIsDeleteOpen({ status: true, id: income._id });
  }

  const configBtnAcceptDelete: BtnAlertActionConfig = {
    onClick: async () => {
      const token = await getAccessTokenSilently();
      const id = isDeleteOpen.id;
      if (!id || !token) return;

      const ingreso = data?.find(item => item._id === id);
      if (!ingreso) return;

      toast.loading('Espere...', { id: toastId });
      const response = await fetchDeleteConceptoIngresos({ id, token });

      if (response.statusCode != 200) {
        toast.error('Error al eliminar el ingreso', { id: toastId });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['conceptos-ingreso'] });
      toast.success("Ingreso eliminado correctamente", { id: toastId });
    }
  }

  const columns = useMemo(() => createColumns({ handleEdit, handleDelete, isFetching: isFetching || isFetchingFuentes }), [isFetching, isFetchingFuentes]);

  const ButtonAddSource = <Button onClick={() => setIsOpenAddEditDialog({ status: true, income: undefined })} className="cursor-pointer" disabled={isFetchingFuentes || isFetching}>Agregar</Button>

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Ingresos mensuales</h1>

      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Aquí puedes gestionar tus ingresos mensuales
      </p>

      <Card className='p-4 bg-card rounded-xl shadow-md'>
        <DataTable columns={columns} data={data} dataLoading={isFetching} toolbarActions={[ButtonAddSource]} sorting={sorting} />
      </Card>

      {
        isOpenAddEditDialog.status && <DialogAddEditIncome
          isOpen={isOpenAddEditDialog}
          setIsOpen={setIsOpenAddEditDialog}
          actualIncomes={data}
          fuentesData={fuentesData}
        />
      }

      {
        isDeleteOpen.status && <AlertAction isOpen={isDeleteOpen.status} onOpenChange={open => setIsDeleteOpen({ status: open, id: isDeleteOpen.id })} title="¿Estás seguro de que deseas eliminar este ingreso?" configBtnAccept={configBtnAcceptDelete} />
      }
    </section>
  );
}
