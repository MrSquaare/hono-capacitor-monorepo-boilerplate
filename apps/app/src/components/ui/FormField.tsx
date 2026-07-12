import { Field } from "@ark-ui/react/field";
import { type ComponentProps, type FC, type ReactNode } from "react";
import { cx, sva } from "styled-system/css";

const recipe = sva({
  base: {
    errorText: {
      color: "red.600",
      fontSize: "xs",
    },
    helperText: {
      color: "neutral.500",
      fontSize: "xs",
    },
    label: {
      color: "neutral.700",
      fontSize: "sm",
      fontWeight: "medium",
    },
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1",
    },
  },
  slots: ["root", "label", "helperText", "errorText"],
});

export type FormFieldProps = ComponentProps<typeof Field.Root> & {
  children: ReactNode;
  errorText?: string;
  helperText?: string;
  label: string;
};

export const FormField: FC<FormFieldProps> = ({
  children,
  className,
  errorText,
  helperText,
  label,
  ...fieldProps
}) => {
  const classes = recipe();

  return (
    <Field.Root className={cx(classes.root, className)} {...fieldProps}>
      <Field.Label className={classes.label}>{label}</Field.Label>
      {children}
      {helperText && (
        <Field.HelperText className={classes.helperText}>
          {helperText}
        </Field.HelperText>
      )}
      {errorText && (
        <Field.ErrorText className={classes.errorText}>
          {errorText}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
};
