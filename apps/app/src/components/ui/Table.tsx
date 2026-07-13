import { type ComponentProps, type FC } from "react";
import { cx, sva } from "styled-system/css";

const recipe = sva({
  base: {
    container: {
      border: "1px solid token(colors.neutral.200)",
      borderRadius: "lg",
      overflowX: "auto",
      width: "full",
    },
    table: {
      borderCollapse: "collapse",
      fontSize: "sm",
      width: "full",
    },
    td: {
      borderBottom: "1px solid token(colors.neutral.200)",
      color: "neutral.700",
      px: "4",
      py: "3",
      verticalAlign: "middle",
    },
    th: {
      bg: "neutral.50",
      borderBottom: "1px solid token(colors.neutral.200)",
      color: "neutral.700",
      fontWeight: "semibold",
      px: "4",
      py: "3",
      textAlign: "left",
    },
  },
  slots: ["container", "table", "th", "td"],
});

export type TableProps = ComponentProps<"table">;

export const Table: FC<TableProps> = ({ children, className, ...props }) => {
  const classes = recipe();

  return (
    <div className={classes.container}>
      <table className={cx(classes.table, className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export type TableThProps = ComponentProps<"th">;

export const TableTh: FC<TableThProps> = ({ className, ...props }) => {
  const classes = recipe();

  return <th className={cx(classes.th, className)} {...props} />;
};

export type TableTdProps = ComponentProps<"td">;

export const TableTd: FC<TableTdProps> = ({ className, ...props }) => {
  const classes = recipe();

  return <td className={cx(classes.td, className)} {...props} />;
};
