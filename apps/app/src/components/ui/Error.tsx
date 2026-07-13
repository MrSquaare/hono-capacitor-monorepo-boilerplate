import type { ErrorRouteComponent } from "@tanstack/react-router";

import { sva } from "styled-system/css";

import { Button } from "./Button";

const recipe = sva({
  base: {
    container: {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: "4",
      justifyContent: "center",
      minHeight: "50vh",
      padding: "6",
      textAlign: "center",
    },
    message: {
      color: "neutral.500",
      fontSize: "sm",
    },
    title: {
      color: "neutral.800",
      fontSize: "xl",
      fontWeight: "semibold",
    },
  },
  slots: ["container", "title", "message"],
});

export const ErrorComponent: ErrorRouteComponent = ({ error, reset }) => {
  const classes = recipe();

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>Something went wrong</h2>
      <p className={classes.message}>{error.message}</p>
      {reset && (
        <Button onClick={reset} size="md" variant="primary">
          Reset
        </Button>
      )}
    </div>
  );
};
