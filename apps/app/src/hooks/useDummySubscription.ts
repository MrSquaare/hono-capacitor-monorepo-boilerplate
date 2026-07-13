import {
  DUMMIES_NOTIFICATION_ROOM_NAME,
  DUMMIES_PARTY_NAME,
} from "@projectname/shared/constants";
import { wsMessageSchema } from "@projectname/shared/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { usePartySocket } from "partysocket/react";
import { useRef } from "react";

import { API_BASE_URL } from "@/lib/env";
import { dummyQueryKeys } from "@/queries/dummy";

export const useDummySubscription = () => {
  const queryClient = useQueryClient();
  const isInitialConnect = useRef(true);

  usePartySocket({
    host: API_BASE_URL.host,
    onMessage(event) {
      try {
        const json = JSON.parse(event.data);
        const message = wsMessageSchema.parse(json);

        if (message.type === "DUMMY_CREATED") {
          queryClient.invalidateQueries({ queryKey: dummyQueryKeys.all });
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    },
    onOpen() {
      if (isInitialConnect.current) {
        isInitialConnect.current = false;
      } else {
        queryClient.invalidateQueries({ queryKey: dummyQueryKeys.all });
      }
    },
    party: DUMMIES_PARTY_NAME,
    room: DUMMIES_NOTIFICATION_ROOM_NAME,
  });
};
