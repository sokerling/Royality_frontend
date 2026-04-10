import "../polyfills/abortController";
import { createActor, createMachine, assign, fromPromise } from "xstate";

interface RequestContext<P, R> {
  payload: P | null;
  output: R | null;
  error: unknown;
}

type RequestEvent<P> = { type: "RUN"; payload: P };

export function runWithXState<P, R>(
  request: (payload: P) => Promise<R>,
  payload: P,
): Promise<R> {
  const machine = createMachine({
    types: {} as {
      context: RequestContext<P, R>;
      events: RequestEvent<P>;
    },
    initial: "idle",
    context: {
      payload: null,
      output: null,
      error: null,
    },
    states: {
      idle: {
        on: {
          RUN: {
            target: "pending",
            actions: assign({
              payload: ({ event }) => event.payload,
            }),
          },
        },
      },
      pending: {
        invoke: {
          src: "requestActor",
          input: ({ context }) => context.payload as P,
          onDone: {
            target: "succeeded",
            actions: assign({
              output: ({ event }) => event.output,
            }),
          },
          onError: {
            target: "failed",
            actions: assign({
              error: ({ event }) => event.error,
            }),
          },
        },
      },
      succeeded: {
        type: "final",
      },
      failed: {
        type: "final",
      },
    },
  }, {
    actors: {
      requestActor: fromPromise<R, P>(async ({ input }) => request(input)),
    },
  });

  return new Promise((resolve, reject) => {
    const actor = createActor(machine);
    const subscription = actor.subscribe((snapshot) => {
      if (snapshot.matches("succeeded")) {
        subscription.unsubscribe();
        actor.stop();
        resolve(snapshot.context.output as R);
        return;
      }
      if (snapshot.matches("failed")) {
        subscription.unsubscribe();
        actor.stop();
        const failure = snapshot.context.error;
        reject(failure instanceof Error ? failure : new Error(String(failure ?? "Request failed")));
      }
    });

    actor.start();
    actor.send({ type: "RUN", payload });
  });
}
