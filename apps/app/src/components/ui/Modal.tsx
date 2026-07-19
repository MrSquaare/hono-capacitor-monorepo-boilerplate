import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { type ComponentProps, type FC } from "react";
import { cx, sva } from "styled-system/css";

const recipe = sva({
  base: {
    backdrop: {
      "&[data-state=closed]": {
        animation: "fadeOut 0.2s token(easings.snappy)",
      },
      "&[data-state=open]": {
        animation: "fadeIn 0.25s token(easings.snappy)",
      },
      bg: "black/60",
      inset: "0",
      position: "fixed",
      zIndex: "overlay",
    },
    body: {
      flex: "1",
      overflowY: "auto",
      px: "6",
      py: "4",
    },
    closeTrigger: {
      background: "none",
      border: "none",
      color: "neutral.500",
      cursor: "pointer",
      fontSize: "lg",
    },
    content: {
      "&[data-state=closed]": {
        animation: "scaleOut 0.2s token(easings.snappy)",
      },
      "&[data-state=open]": {
        animation: "scaleIn 0.25s token(easings.snappy)",
      },
      bg: "white",
      borderRadius: "lg",
      boxShadow: "lg",
      display: "flex",
      flexDirection: "column",
      maxHeight: "90vh",
      maxWidth: { base: "full", sm: "md" },
      overflow: "hidden",
      width: "full",
    },
    footer: {
      borderTop: "1px solid token(colors.neutral.200)",
      display: "flex",
      flexShrink: "0",
      gap: "2",
      justifyContent: "flex-end",
      px: "6",
      py: "4",
    },
    header: {
      alignItems: "center",
      borderBottom: "1px solid token(colors.neutral.200)",
      display: "flex",
      flexShrink: "0",
      justifyContent: "space-between",
      px: "6",
      py: "4",
    },
    positioner: {
      alignItems: "center",
      display: "flex",
      inset: "0",
      justifyContent: "center",
      p: "4",
      position: "fixed",
      zIndex: "modal",
    },
    title: {
      color: "neutral.900",
      fontSize: "lg",
      fontWeight: "semibold",
    },
  },
  slots: [
    "backdrop",
    "positioner",
    "content",
    "header",
    "title",
    "closeTrigger",
    "body",
    "footer",
  ],
});

export type ModalProps = ComponentProps<typeof Dialog.Root> & {
  className?: string;
};

export const Modal: FC<ModalProps> = ({ children, className, ...props }) => {
  const classes = recipe();

  return (
    <Dialog.Root lazyMount unmountOnExit {...props}>
      <Portal>
        <Dialog.Backdrop className={classes.backdrop} />
        <Dialog.Positioner className={classes.positioner}>
          <Dialog.Content className={cx(classes.content, className)}>
            {children}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export type ModalHeaderProps = ComponentProps<"div"> & { title: string };

export const ModalHeader: FC<ModalHeaderProps> = ({
  className,
  title,
  ...props
}) => {
  const classes = recipe();

  return (
    <div className={cx(classes.header, className)} {...props}>
      <Dialog.Title className={classes.title}>{title}</Dialog.Title>
      <Dialog.CloseTrigger aria-label="Close" className={classes.closeTrigger}>
        ✕
      </Dialog.CloseTrigger>
    </div>
  );
};

export type ModalBodyProps = ComponentProps<"div">;

export const ModalBody: FC<ModalBodyProps> = ({ className, ...props }) => {
  const classes = recipe();

  return <div className={cx(classes.body, className)} {...props} />;
};

export type ModalFooterProps = ComponentProps<"div">;

export const ModalFooter: FC<ModalFooterProps> = ({ className, ...props }) => {
  const classes = recipe();

  return <div className={cx(classes.footer, className)} {...props} />;
};
