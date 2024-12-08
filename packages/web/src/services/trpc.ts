import {
  createTRPCClient,
  createWSClient,
  httpLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import type { AppRouter } from "../../../backend/src/server";

const wsClient = createWSClient({
  url: `ws://localhost:3333`,
});

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition(op) {
        return op.type === "subscription";
      },
      true: wsLink({
        client: wsClient,
      }),
      false: httpLink({
        url: `http://localhost:3333`,
      }),
    }),
  ],
});
