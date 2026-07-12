import { type ComponentProps, type FC } from "react";
import { cva, cx, type RecipeVariantProps } from "styled-system/css";

const recipe = cva({
  base: {
    _disabled: { cursor: "not-allowed", opacity: 0.5 },
    _hover: { opacity: 0.8 },
    alignItems: "center",
    borderRadius: "md",
    cursor: "pointer",
    display: "inline-flex",
    fontWeight: "medium",
    justifyContent: "center",
    transition: "opacity 0.15s",
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
  variants: {
    size: {
      lg: { fontSize: "md", px: "5", py: "2.5" },
      md: { fontSize: "sm", px: "4", py: "2" },
      sm: { fontSize: "xs", px: "3", py: "1.5" },
    },
    variant: {
      danger: { bg: "red.600", color: "white" },
      primary: {
        bg: "transparent",
        border: "1px solid token(colors.neutral.300)",
        color: "neutral.700",
      },
    },
  },
});

export type ButtonProps = ComponentProps<"button"> &
  RecipeVariantProps<typeof recipe>;

export const Button: FC<ButtonProps> = ({
  className,
  size,
  variant,
  ...props
}) => {
  return (
    <button className={cx(recipe({ size, variant }), className)} {...props} />
  );
};
