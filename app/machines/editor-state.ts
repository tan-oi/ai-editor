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

    clearError: assign({
      error: null,
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
            let errorMessage = "The AI service is temporarily unavailable.";
            try {
              const errorData = await response.json();
              if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (e) {}
            throw new Error(errorMessage);
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
          actions: "clearError",
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
      always: {
        target: "idle",
        guard: ({ context }) =>
          !context.editorInstance || context.insertPosition === null,
        actions: {
          type: "setError",
          params: () => ({ message: "Editor not ready" }),
        },
      },
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
          target: "idle",
          guard: ({ context }) => {
            return (
              context.editorInstance !== null && context.insertPosition !== null
            );
          },
          actions: {
            type: "insertText",
            params: ({ context, event }) => {
              const view = context.editorInstance;
              const position = context.insertPosition;

              return {
                generatedText: event.output as string,
                position: position!,
                view: view!,
              };
            },
          },
        },
        onError: {
          target: "idle",
          actions: {
            type: "setError",
            params: ({ event }) => ({
              message:
                (event.error as Error).message ||
                "An unexpected error occurred",
            }),
          },
        },
      },
    },
  },
});
