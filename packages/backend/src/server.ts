import { initTRPC } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { observable } from "@trpc/server/observable";
import cors from "cors";
import { WebSocketServer } from "ws";
import { z } from "zod";
import { game, Room } from "./game";

function createContext(
  opts: CreateHTTPContextOptions | CreateWSSContextFnOptions
) {
  return {};
}
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  joinRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        sessionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const room = game.joinOrCreateRoom({
        roomId: input.roomId,
        sessionId: input.sessionId,
      });
      return { room };
    }),
  play: publicProcedure
    .input(
      z.object({
        x: z.number(),
        y: z.number(),
        roomId: z.string(),
        sessionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { room } = game.onGameMove(input.roomId, input.sessionId, {
        x: input.x,
        y: input.y,
      });
      return { room };
    }),
  giveUp: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        sessionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const room = game.onGiveUp(input.roomId, input.sessionId);
      return { room };
    }),
  message: publicProcedure
    .input(
      z.object({
        message: z.string(),
        roomId: z.string(),
        sessionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const room = game.addMessage(
        input.roomId,
        input.sessionId,
        "player",
        input.message,
        true
      );
      return { room };
    }),
  onGameChange: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        sessionId: z.string(),
      })
    )
    .subscription(({ input }) => {
      const room = game.connectUser(input.roomId, input.sessionId);

      setTimeout(() => {
        if (room != null) {
          game.onStartGame(room.id);
        }
      }, 1000);

      return observable<{ room: Room }>((emit) => {
        game.addObserver({
          sessionId: input.sessionId as string,
          roomId: input.roomId as string,
          update(room) {
            if (room.id === input.roomId) {
              emit.next({ room });
            }
          },
        });

        return () => {
          game.onDisconnect(input.roomId, input.sessionId);
          game.removeObserver(
            input.sessionId as string,
            input.roomId as string
          );
        };
      });
    }),
});

export type AppRouter = typeof appRouter;

// http server
const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext,
  onError({ error }) {
    console.error("trpc error", error);
  },
});

// ws server
const wss = new WebSocketServer({ server });
applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext,
});

// setInterval(() => {
//   console.log("Connected clients", wss.clients.size, game.rooms);
// }, 10000);
server.listen(3333);
