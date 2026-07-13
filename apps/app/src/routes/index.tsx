import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FC, useCallback, useEffect } from "react";
import { css } from "styled-system/css";
import { z } from "zod";

import { ConfirmDeleteDummyModal } from "@/components/dummy/ConfirmDeleteDummyModal";
import {
  CreateEditDummyModal,
  type DummyFormValues,
} from "@/components/dummy/CreateEditDummyModal";
import { DummyDetailModal } from "@/components/dummy/DummyDetailModal";
import { DummyList } from "@/components/dummy/DummyList";
import { Button } from "@/components/ui/Button";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { useDummySubscription } from "@/hooks/useDummySubscription";
import { toaster } from "@/lib/toaster";
import * as m from "@/paraglide/messages";
import {
  dummyQueryOptions,
  useCreateDummy,
  useDeleteDummy,
  useDummies,
  useUpdateDummy,
} from "@/queries/dummy";

const searchSchema = z.object({
  create: z.boolean().optional(),
  delete: z.coerce.number().optional(),
  detail: z.coerce.number().optional(),
  edit: z.coerce.number().optional(),
});

const page = css({
  display: "flex",
  flexDirection: "column",
  gap: "6",
  maxWidth: "4xl",
  minHeight: "full",
  mx: "auto",
  p: { base: "4", md: "8" },
});

const header = css({
  alignItems: "center",
  bg: "white",
  display: "flex",
  justifyContent: "space-between",
  position: "sticky",
  py: "2",
  top: "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))",
  zIndex: "10",
});

const title = css({
  color: "neutral.900",
  fontSize: "2xl",
  fontWeight: "bold",
});

const errorCallout = css({
  bg: "red.50",
  border: "1px solid token(colors.red.200)",
  borderRadius: "md",
  color: "red.700",
  fontSize: "sm",
  p: "4",
});

const loadingCallout = css({
  bg: "neutral.100",
  border: "1px solid token(colors.neutral.200)",
  borderRadius: "md",
  color: "neutral.700",
  fontSize: "sm",
  p: "4",
});

const emptyText = css({
  color: "neutral.500",
  fontSize: "sm",
  py: "8",
  textAlign: "center",
});

export const DummiesLayout: FC = () => {
  const navigate = useNavigate({ from: "/" });
  const { create, delete: deleteId, detail, edit } = Route.useSearch();
  const { data: dummies, error, isPending, refetch } = useDummies();
  const { data: dummy, error: dummyError } = useQuery({
    ...dummyQueryOptions(detail ?? edit ?? deleteId ?? 0),
    enabled: (detail ?? edit ?? deleteId) !== undefined,
  });
  const createDummy = useCreateDummy();
  const updateDummy = useUpdateDummy(edit ?? 0);
  const deleteDummy = useDeleteDummy();

  useDummySubscription();

  const handleClose = useCallback(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        create: undefined,
        delete: undefined,
        detail: undefined,
        edit: undefined,
      }),
    });
  }, [navigate]);

  const handleSubmit = async (values: DummyFormValues) => {
    if (edit !== undefined) {
      await updateDummy.mutateAsync(values, {
        onError: () => {
          toaster.error({ title: m["dummies.errors.update"]() });
        },
        onSuccess: () => {
          toaster.success({ title: m["dummies.success.update"]() });
          handleClose();
        },
      });
    } else {
      await createDummy.mutateAsync(values, {
        onError: () => {
          toaster.error({ title: m["dummies.errors.create"]() });
        },
        onSuccess: () => {
          toaster.success({ title: m["dummies.success.create"]() });
          handleClose();
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleteId !== undefined) {
      deleteDummy.mutate(deleteId, {
        onError: () => {
          toaster.error({ title: m["dummies.errors.delete"]() });
        },
        onSuccess: () => {
          toaster.success({ title: m["dummies.success.delete"]() });
          handleClose();
        },
      });
    }
  };

  useEffect(() => {
    if (dummyError) {
      toaster.error({
        description: dummyError.message,
        title: m["dummies.errors.load_one"](),
      });
      handleClose();
    }
  }, [dummyError, handleClose]);

  return (
    <PullToRefresh
      onRefresh={async () => {
        await refetch();
      }}
    >
      <div className={page}>
        <div className={header}>
          <h1 className={title}>{m["dummies.page.title"]()}</h1>
          <Button
            onClick={() =>
              navigate({ search: (prev) => ({ ...prev, create: true }) })
            }
          >
            {m["common.create"]()}
          </Button>
        </div>

        {error && (
          <div className={errorCallout}>
            {m["dummies.errors.load_all"]({ error: error.message })}
          </div>
        )}

        {isPending && (
          <div className={loadingCallout}>{m["common.loading"]()}</div>
        )}

        {!isPending && dummies?.length === 0 && (
          <p className={emptyText}>{m["dummies.list.empty"]()}</p>
        )}

        {dummies && dummies.length > 0 && (
          <DummyList
            dummies={dummies}
            onDelete={(id) =>
              navigate({ search: (prev) => ({ ...prev, delete: id }) })
            }
            onEdit={(id) =>
              navigate({ search: (prev) => ({ ...prev, edit: id }) })
            }
            onView={(id) =>
              navigate({ search: (prev) => ({ ...prev, detail: id }) })
            }
          />
        )}

        <DummyDetailModal
          dummy={dummy}
          onClose={handleClose}
          open={detail !== undefined && dummy !== undefined}
        />

        <CreateEditDummyModal
          dummy={dummy}
          isPending={createDummy.isPending || updateDummy.isPending}
          onClose={handleClose}
          onSubmit={handleSubmit}
          open={
            create !== undefined || (edit !== undefined && dummy !== undefined)
          }
        />

        <ConfirmDeleteDummyModal
          dummy={dummy}
          isPending={deleteDummy.isPending}
          onClose={handleClose}
          onConfirm={handleDelete}
          open={deleteId !== undefined && dummy !== undefined}
        />
      </div>
    </PullToRefresh>
  );
};

export const Route = createFileRoute("/")({
  component: DummiesLayout,
  validateSearch: (search) => searchSchema.parse(search),
});
