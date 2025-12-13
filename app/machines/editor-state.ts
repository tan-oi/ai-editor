import { EditorView } from "prosemirror-view";
import { setup, assign, fromPromise, assertEvent } from "xstate";
import { TextStyle, EditorContext } from "@/lib/types";

export const EditorMachine = setup({
  types: {
    context: {} as EditorContext,
    events: {} as
      | { type: "continueWriting"; from: number; to: number; empty: boolean }
      | { type: "setStyle"; style: TextStyle }
      | { type: "setEditor"; editor: EditorView }
      | { type: "cancel" },
  },
  actions: {
    setCurrentStyle: assign({
      textStyle: (_, params: { style: TextStyle }) => params.style,
    }),

    preparePayload: assign(
      (
        _,
        params: {
          contextText: string | null;
          insertPosition: number | null;
          isSelection: boolean;
        }
      ) => ({
        contextText: params.contextText,
        insertPosition: params.insertPosition,
        isSelection: params.isSelection,
      })
    ),

    setEditor: assign({
      editorInstance: (_, params: { editor: EditorView }) => params.editor,
    }),

    insertText: (
      _,
      params: { generatedText: string; position: number; view: EditorView }
    ) => {
      const { generatedText, position, view } = params;
      const { state, dispatch } = view;
      const tr = state.tr.insertText(" " + generatedText, position);
      dispatch(tr);
    },

    setError: assign({
      error: (_, params: { message: string }) => params.message,
    }),
  },

  actors: {
    generateText: fromPromise(
      async ({
        input,
      }: {
        input: {
          contextText: string;
          style: TextStyle;
          isSelection: boolean;
        };
      }) => {
        try {
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contextText: input.contextText,
              style: input.style,
              isSelection: input.isSelection,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (!data.content) {
            throw new Error("No content in response");
          }

          return data.content;
        } catch (error) {
          throw error instanceof Error
            ? error
            : new Error("Failed to generate text");
        }
      }
    ),
  },
}).createMachine({
  id: "editor",
  initial: "init",
  context: {
    editorInstance: null,
    insertPosition: 1,
    textStyle: "auto",
    contextText: null,
    error: null,
    isSelection: false,
  },

  states: {
    init: {
      on: {
        setEditor: {
          target: "idle",
          actions: {
            type: "setEditor",
            params: ({ event }) => ({
              editor: event.editor,
            }),
          },
        },
      },
    },
    idle: {
      on: {
        continueWriting: {
          target: "fetching",
          guard: ({ context }) => context.editorInstance !== null,
        },
        setStyle: {
          actions: {
            type: "setCurrentStyle",
            params: ({ event }) => ({
              style: event.style,
            }),
          },
        },
      },
    },
    fetching: {
      entry: [
        {
          type: "preparePayload",
          params: ({ context, event }) => {
            assertEvent(event, "continueWriting");

            const view = context.editorInstance;

            if (!view) {
              return {
                contextText: null,
                insertPosition: null,
                isSelection: false,
              };
            }

            const { to, from, empty } = event;

            let contextText: string | null;
            if (!empty) {
              contextText = view.state.doc.textBetween(from, to);
            } else {
              const fullText = view.state.doc.textContent || "";
              if (fullText.length <= 2000) {
                contextText = fullText;
              } else {
                const start = Math.max(0, from - 2000);
                contextText = view.state.doc.textBetween(start, from);
              }
            }

            return {
              contextText,
              insertPosition: to,
              isSelection: !empty,
            };
          },
        },
      ],
      on: {
        setStyle: {
          actions: {
            type: "setCurrentStyle",
            params: ({ event }) => ({
              style: event.style,
            }),
          },
        },
      },
      invoke: {
        id: "generateMoreText",
        src: "generateText",
        input: ({ context }) => ({
          contextText: context.contextText ?? "",
          style: context.textStyle,
          isSelection: context.isSelection,
        }),
        onDone: {
          target: "success",
          actions: {
            type: "insertText",
            params: ({ context, event }) => {
              const view = context.editorInstance;
              const position = context.insertPosition;

              if (!view || position === null) {
                throw new Error("Invalid state: missing view or position");
              }

              return {
                generatedText: event.output as string,
                position,
                view,
              };
            },
          },
        },
        onError: {
          target: "failure",
          actions: {
            type: "setError",
            params: () => ({
              message: "Something went wrong",
            }),
          },
        },
      },
    },
    success: {
      after: {
        0: "idle",
      },
    },
    failure: {
      after: {
        0: "idle",
      },
    },
  },
});
