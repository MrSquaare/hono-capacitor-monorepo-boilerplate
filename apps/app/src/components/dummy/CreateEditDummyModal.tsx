import type { Dummy } from "@projectname/shared/schemas";

import { useForm } from "@tanstack/react-form";
import { type ComponentProps, type FC, useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { FormFieldInput } from "@/components/ui/FormFieldInput";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/Modal";
import { usePreservedValue } from "@/hooks/usePreservedValue";
import { setFormServerErrors } from "@/lib/form";
import * as m from "@/paraglide/messages";

const formSchema = z.object({
  age: z.number().int().min(0, "Age must be a positive number"),
  name: z.string().min(1, "Name is required"),
});

export type CreateEditDummyModalProps = ComponentProps<typeof Modal> & {
  dummy?: Dummy;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: DummyFormValues) => Promise<void> | void;
};

export type DummyFormValues = z.infer<typeof formSchema>;

export const CreateEditDummyModal: FC<CreateEditDummyModalProps> = ({
  dummy,
  isPending,
  onClose,
  onSubmit,
  open,
  ...props
}) => {
  const cachedDummy = usePreservedValue(dummy);
  const [prevOpen, setPrevOpen] = useState<boolean | undefined>(open);
  const [isEdit, setIsEdit] = useState(dummy !== undefined);

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setIsEdit(dummy !== undefined);
    }
  }

  const displayDummy = isEdit ? (dummy ?? cachedDummy) : undefined;

  const form = useForm({
    defaultValues: {
      age: displayDummy?.age ?? 0,
      name: displayDummy?.name ?? "",
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await onSubmit(value);
      } catch (error) {
        setFormServerErrors(formApi, error);
      }
    },
    validators: { onSubmit: formSchema },
  });
  const formReset = form.reset;

  useEffect(() => {
    if (open) {
      formReset();
    }
  }, [open, formReset]);

  return (
    <Modal
      onOpenChange={(e) => {
        if (!e.open) {
          onClose();
        }
      }}
      open={open}
      {...props}
    >
      <ModalHeader
        title={isEdit ? m["dummies.edit.title"]() : m["dummies.create.title"]()}
      />
      <ModalBody>
        <form
          id="dummy-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <FormField
                errorText={field.state.meta.errors
                  .map((i) => i?.message)
                  .join(", ")}
                invalid={!field.state.meta.isValid}
                label={m["dummies.common.name"]()}
              >
                <FormFieldInput
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="age">
            {(field) => (
              <FormField
                errorText={field.state.meta.errors
                  .map((i) => i?.message)
                  .join(", ")}
                invalid={!field.state.meta.isValid}
                label={m["dummies.common.age"]()}
              >
                <FormFieldInput
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  type="number"
                  value={field.state.value}
                />
              </FormField>
            )}
          </form.Field>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} type="button">
          {m["common.cancel"]()}
        </Button>
        <Button disabled={isPending} form="dummy-form" type="submit">
          {isPending
            ? m["common.saving"]()
            : isEdit
              ? m["common.edit"]()
              : m["common.create"]()}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
