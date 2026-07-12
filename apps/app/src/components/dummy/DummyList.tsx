import type { Dummy } from "@projectname/shared/schemas";

import { type FC } from "react";
import { sva } from "styled-system/css";

import { Button } from "@/components/ui/Button";
import { Table, TableTd, TableTh } from "@/components/ui/Table";
import * as m from "@/paraglide/messages";

const recipe = sva({
  base: {
    actions: {
      display: "flex",
      gap: "2",
    },
  },
  slots: ["actions"],
});

export type DummyListProps = {
  dummies: Dummy[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
};

export const DummyList: FC<DummyListProps> = ({
  dummies,
  onDelete,
  onEdit,
  onView,
}) => {
  const classes = recipe();

  return (
    <Table>
      <thead>
        <tr>
          <TableTh>{m["dummies.common.id"]()}</TableTh>
          <TableTh>{m["dummies.common.name"]()}</TableTh>
          <TableTh>{m["dummies.common.age"]()}</TableTh>
          <TableTh>{m["common.actions"]()}</TableTh>
        </tr>
      </thead>

      <tbody>
        {dummies.map((dummy) => (
          <tr key={dummy.id}>
            <TableTd>{dummy.id}</TableTd>
            <TableTd>{dummy.name}</TableTd>
            <TableTd>{dummy.age}</TableTd>
            <TableTd>
              <div className={classes.actions}>
                <Button onClick={() => onView(dummy.id)} size="sm">
                  {m["common.view"]()}
                </Button>

                <Button onClick={() => onEdit(dummy.id)} size="sm">
                  {m["common.edit"]()}
                </Button>

                <Button
                  onClick={() => onDelete(dummy.id)}
                  size="sm"
                  variant="danger"
                >
                  {m["common.delete"]()}
                </Button>
              </div>
            </TableTd>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
