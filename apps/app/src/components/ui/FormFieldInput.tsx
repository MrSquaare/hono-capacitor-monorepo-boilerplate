import { Field } from "@ark-ui/react/field";
import { type ComponentProps, type FC } from "react";
import { cva, cx, type RecipeVariantProps } from "styled-system/css";

const recipe = cva({
  base: {
    _disabled: { bg: "neutral.50", cursor: "not-allowed", opacity: 0.5 },
    _focus: {
      borderColor: "blue.500",
      boxShadow: "0 0 0 1px token(colors.blue.500)",
    },
    _invalid: { borderColor: "red.500" },
    border: "1px solid token(colors.neutral.300)",
    borderRadius: "md",
    fontSize: "sm",
    outline: "none",
    px: "3",
    py: "2",
    width: "full",
  },
});

export type FormFieldInputProps = ComponentProps<typeof Field.Input> &
  RecipeVariantProps<typeof recipe>;

export const FormFieldInput: FC<FormFieldInputProps> = ({
  className,
  ...props
}) => {
  return <Field.Input className={cx(recipe(), className)} {...props} />;
};
