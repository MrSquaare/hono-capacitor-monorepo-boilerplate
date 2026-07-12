import { defineRelations } from "drizzle-orm";

import * as schemas from "./schemas";

export const relations = defineRelations(schemas, () => ({}));
