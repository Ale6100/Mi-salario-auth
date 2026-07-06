// src\components\Page\Expenses\table\Table.tsx

import type { BtnAlertActionConfig } from "@/components/utils/AlertAction";
import { useFuentesGastos } from "@/hooks/useFuentesGastos";
import { fetchDeleteConceptoGastos } from "@/lib/fetch/conceptosGastos";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";
import { useAuth0 } from "@auth0/auth0-react";
import { useQueryClient } from "@tanstack/react-query";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { createColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/utils/DataTable";
import AlertAction from "@/components/utils/AlertAction";
import { DialogAddEditExpense } from "./DialogAddEditExpense";
import { DialogEditPagado } from "./DialogEditPagado";

type TableProps = {
  readonly data: ConceptoGastosDB[];
  readonly isFetching: boolean;
}

export const Table = ({ data, isFetching }: TableProps) => {
  const { user, getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const { data: fuentesData, isFetching: isFetchingFuentes } = useFuentesGastos({ user });

  const [ sorting ] = useState([
    {
      id: 'periodo',
      desc: true,
    }
  ]);

  const [ isOpenAddEditDialog, setIsOpenAddEditDialog ] = useState<{ status: boolean, expense: ConceptoGastosDB | undefined }>({ status: false, expense: undefined });
  const [ isDeleteOpen, setIsDeleteOpen ] = useState({ status: false, id: "" });
  const [ isOpenEditPagadoDialog, setIsOpenEditPagadoDialog ] = useState<{ status: boolean, expense: ConceptoGastosDB | undefined }>({ status: false, expense: undefined });

  const handleEdit = (expense: ConceptoGastosDB) => {
    setIsOpenAddEditDialog({ status: true, expense });
  }

  const handleDelete = (expense: ConceptoGastosDB) => {
    setIsDeleteOpen({ status: true, id: expense._id });
  }

  const handleEditPagado = (expense: ConceptoGastosDB) => {
    setIsOpenEditPagadoDialog({ status: true, expense });
  }

  const configBtnAcceptDelete: BtnAlertActionConfig = {
    onClick: async () => {
      const token = await getAccessTokenSilently();
      const id = isDeleteOpen.id;
      if (!id || !token) return;

      const gasto = data?.find(item => item._id === id);
      if (!gasto) return;

      toast.loading('Espere...', { id: toastId });
      const response = await fetchDeleteConceptoGastos({ id, token });

      if (response.statusCode != 200) {
        toast.error('Error al eliminar el gasto', { id: toastId });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['conceptos-gastos'] });
      toast.success('Gasto eliminado correctamente', { id: toastId });
    }
  }

  const columns = useMemo(() => createColumns({ handleEdit, handleDelete, handleEditPagado, isFetching: isFetching || isFetchingFuentes }), [isFetching, isFetchingFuentes]);

  const ButtonAddExpense = <Button onClick={() => setIsOpenAddEditDialog({ status: true, expense: undefined })} className="cursor-pointer" disabled={isFetchingFuentes || isFetching}>Agregar</Button>

  return (
    <>
    <Card className='p-4 bg-card rounded-xl shadow-md'>
      <DataTable columns={columns} data={data} dataLoading={isFetching} toolbarActions={[ButtonAddExpense]} sorting={sorting} />
    </Card>

    {
      isOpenAddEditDialog.status && <DialogAddEditExpense
        isOpen={isOpenAddEditDialog}
        setIsOpen={setIsOpenAddEditDialog}
        actualExpenses={data}
        fuentesData={fuentesData}
      />
    }

    {
      isOpenEditPagadoDialog.status && <DialogEditPagado
        isOpen={isOpenEditPagadoDialog}
        setIsOpen={setIsOpenEditPagadoDialog}
      />
    }

    {
      isDeleteOpen.status && <AlertAction isOpen={isDeleteOpen.status} onOpenChange={open => setIsDeleteOpen({ status: open, id: isDeleteOpen.id })} title="¿Estás seguro de que deseas eliminar este gasto?" configBtnAccept={configBtnAcceptDelete} />
    }
    </>
  )
}