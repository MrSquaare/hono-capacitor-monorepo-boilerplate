import { Toaster as ArkUIToaster, Toast } from "@ark-ui/react/toast";
import { type FC } from "react";
import { sva } from "styled-system/css";

import { toaster } from "@/lib/toaster";

const recipe = sva({
  base: {
    closeTrigger: {
      _hover: { opacity: "1" },
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "sm",
      opacity: "0.7",
      position: "absolute",
      right: "2",
      top: "2",
    },
    description: {
      fontSize: "sm",
      opacity: "0.9",
    },
    root: {
      borderRadius: "md",
      boxShadow: "lg",
      display: "flex",
      flexDirection: "column",
      gap: "1",
      maxWidth: "360px",
      minWidth: "280px",
      padding: "4",
      position: "relative",
    },
    title: {
      fontSize: "sm",
      fontWeight: "semibold",
    },
  },
  defaultVariants: { type: "info" },
  slots: ["root", "title", "description", "closeTrigger"],
  variants: {
    type: {
      error: { root: { bg: "red.500", color: "white" } },
      info: { root: { bg: "blue.500", color: "white" } },
      success: { root: { bg: "green.500", color: "white" } },
    },
  },
});

export const Toaster: FC = () => {
  return (
    <ArkUIToaster toaster={toaster}>
      {(toast) => {
        const classes = recipe({
          type: toast.type as "error" | "info" | "success",
        });

        return (
          <Toast.Root className={classes.root} key={toast.id}>
            <Toast.Title className={classes.title}>{toast.title}</Toast.Title>
            {toast.description && (
              <Toast.Description className={classes.description}>
                {toast.description}
              </Toast.Description>
            )}
            <Toast.CloseTrigger className={classes.closeTrigger}>
              ✕
            </Toast.CloseTrigger>
          </Toast.Root>
        );
      }}
    </ArkUIToaster>
  );
};
