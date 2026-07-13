import type { Dummy } from "@projectname/shared/schemas";

import { type ComponentProps, type FC } from "react";
import { sva } from "styled-system/css";

import { Modal, ModalBody, ModalHeader } from "@/components/ui/Modal";
import { usePreservedValue } from "@/hooks/usePreservedValue";
import * as m from "@/paraglide/messages";

const recipe = sva({
  base: {
    body: { display: "flex", flexDirection: "column", gap: "4" },
    label: {
      color: "neutral.700",
      fontSize: "sm",
      fontWeight: "medium",
    },
    row: { display: "flex", flexDirection: "column", gap: "1" },
    value: { color: "neutral.700", fontSize: "md" },
  },
  slots: ["body", "row", "label", "value"],
});

export type DummyDetailModalProps = ComponentProps<typeof Modal> & {
  dummy?: Dummy;
  onClose: () => void;
};

export const DummyDetailModal: FC<DummyDetailModalProps> = ({
  dummy,
  onClose,
  ...props
}) => {
  const classes = recipe();
  const displayDummy = usePreservedValue(dummy);

  return (
    <Modal
      {...props}
      onOpenChange={(e) => {
        props.onOpenChange?.(e);

        if (!e.open) {
          onClose();
        }
      }}
    >
      <ModalHeader title={m["dummies.detail.title"]()} />
      <ModalBody>
        {displayDummy && (
          <div className={classes.body}>
            <div className={classes.row}>
              <span className={classes.label}>{m["dummies.common.id"]()}</span>
              <span className={classes.value}>{displayDummy.id}</span>
            </div>
            <div className={classes.row}>
              <span className={classes.label}>
                {m["dummies.common.name"]()}
              </span>
              <span className={classes.value}>{displayDummy.name}</span>
            </div>
            <div className={classes.row}>
              <span className={classes.label}>{m["dummies.common.age"]()}</span>
              <span className={classes.value}>{displayDummy.age}</span>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};
