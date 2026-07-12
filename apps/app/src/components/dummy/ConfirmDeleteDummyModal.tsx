import type { Dummy } from "@projectname/shared/schemas";

import { type ComponentProps, type FC } from "react";
import { css } from "styled-system/css";

import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/Modal";
import { usePreservedValue } from "@/hooks/usePreservedValue";
import * as m from "@/paraglide/messages";

export type ConfirmDeleteDummyModalProps = ComponentProps<typeof Modal> & {
  dummy?: Dummy;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmDeleteDummyModal: FC<ConfirmDeleteDummyModalProps> = ({
  dummy,
  isPending,
  onClose,
  onConfirm,
  ...props
}) => {
  const displayDummy = usePreservedValue(dummy);

  return (
    <Modal
      onOpenChange={(e) => {
        if (!e.open) {
          onClose();
        }
      }}
      {...props}
    >
      <ModalHeader title={m["dummies.delete.title"]()} />
      <ModalBody>
        <p className={css({ color: "neutral.700", fontSize: "sm" })}>
          {m["dummies.delete.confirm"]({ name: displayDummy?.name || "" })}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button disabled={isPending} onClick={onClose}>
          {m["common.cancel"]()}
        </Button>
        <Button disabled={isPending} onClick={onConfirm} variant="danger">
          {isPending ? m["common.deleting"]() : m["common.delete"]()}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
