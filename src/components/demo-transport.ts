import { StaticChatTransport } from "@loremllm/transport";

export const transport = new StaticChatTransport({
  chunkDelayMs: [50, 200],
  async *mockResponse() {
    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_95017036",
      state: "input-available",
      input: {
        type: "frame",
        label: "Background Sky",
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#87CEEB",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_95017036",
      state: "output-available",
      input: {
        type: "frame",
        label: "Background Sky",
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#87CEEB",
      },
      output:
        'Successfully generated frame block "Background Sky" with ID 97a14f2f-52c4-4085-a111-d61712ebcfda.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_95017036",
      data: {
          block: {
            id: "97a14f2f-52c4-4085-a111-d61712ebcfda",
            type: "frame",
            label: "Background Sky",
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#87CEEB",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_25310002",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree1 Trunk",
        x: 300,
        y: 400,
        width: 30,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_25310002",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree1 Trunk",
        x: 300,
        y: 400,
        width: 30,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree1 Trunk" with ID e6008550-a709-486e-a691-9d2f3c39b730.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_25310002",
      data: {
          block: {
            id: "e6008550-a709-486e-a691-9d2f3c39b730",
            type: "frame",
            label: "Tree1 Trunk",
            x: 300,
            y: 400,
            width: 30,
            height: 200,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_59834983",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree1 Leaves",
        x: 240,
        y: 260,
        width: 150,
        height: 150,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 75,
          tr: 75,
          br: 75,
          bl: 75,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_59834983",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree1 Leaves",
        x: 240,
        y: 260,
        width: 150,
        height: 150,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 75,
          tr: 75,
          br: 75,
          bl: 75,
        },
      },
      output:
        'Successfully generated frame block "Tree1 Leaves" with ID ec3e9707-e9b1-4cb2-a16f-848bed3fd078.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_59834983",
      data: {
        "generate-frame-block": {
          block: {
            id: "ec3e9707-e9b1-4cb2-a16f-848bed3fd078",
            type: "frame",
            label: "Tree1 Leaves",
            x: 240,
            y: 260,
            width: 150,
            height: 150,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 75,
              tr: 75,
              br: 75,
              bl: 75,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_92343095",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree2 Trunk",
        x: 500,
        y: 350,
        width: 40,
        height: 250,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_92343095",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree2 Trunk",
        x: 500,
        y: 350,
        width: 40,
        height: 250,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree2 Trunk" with ID 1630b292-8fc1-4067-9c78-09589ed01a3d.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_92343095",
      data: {
          block: {
            id: "1630b292-8fc1-4067-9c78-09589ed01a3d",
            type: "frame",
            label: "Tree2 Trunk",
            x: 500,
            y: 350,
            width: 40,
            height: 250,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_82410342",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree2 Leaves",
        x: 440,
        y: 160,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 100,
          tr: 100,
          br: 100,
          bl: 100,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_82410342",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree2 Leaves",
        x: 440,
        y: 160,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 100,
          tr: 100,
          br: 100,
          bl: 100,
        },
      },
      output:
        'Successfully generated frame block "Tree2 Leaves" with ID 98e0db01-a16d-4a40-8ed6-abc085962b64.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_82410342",
      data: {
        "generate-frame-block": {
          block: {
            id: "98e0db01-a16d-4a40-8ed6-abc085962b64",
            type: "frame",
            label: "Tree2 Leaves",
            x: 440,
            y: 160,
            width: 200,
            height: 200,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 100,
              tr: 100,
              br: 100,
              bl: 100,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_96486827",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree3 Trunk",
        x: 700,
        y: 450,
        width: 25,
        height: 180,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_96486827",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree3 Trunk",
        x: 700,
        y: 450,
        width: 25,
        height: 180,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree3 Trunk" with ID 2443c4b5-a22d-476e-8da6-1f3143170b84.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_96486827",
      data: {
          block: {
            id: "2443c4b5-a22d-476e-8da6-1f3143170b84",
            type: "frame",
            label: "Tree3 Trunk",
            x: 700,
            y: 450,
            width: 25,
            height: 180,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_91569788",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree3 Leaves",
        x: 651,
        y: 343,
        width: 120,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 60,
          tr: 60,
          br: 60,
          bl: 60,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_91569788",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree3 Leaves",
        x: 651,
        y: 343,
        width: 120,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 60,
          tr: 60,
          br: 60,
          bl: 60,
        },
      },
      output:
        'Successfully generated frame block "Tree3 Leaves" with ID bdb21e06-2935-4df8-aa73-952e960c1f95.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_91569788",
      data: {
        "generate-frame-block": {
          block: {
            id: "bdb21e06-2935-4df8-aa73-952e960c1f95",
            type: "frame",
            label: "Tree3 Leaves",
            x: 640,
            y: 310,
            width: 120,
            height: 120,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 60,
              tr: 60,
              br: 60,
              bl: 60,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateTextBlock",
      toolCallId: "call_32334326",
      state: "input-available",
      input: {
        type: "text",
        label: "Poster Title",
        x: 640,
        y: 100,
        width: 800,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        text: "Forest Poster",
        color: "#228B22",
        fontSize: 48,
        lineHeight: 1.2,
        letterSpacing: 1,
        textAlign: "center",
        font: {
          family: "Arial",
          weight: "bold",
        },
      },
    };

    yield {
      type: "tool-generateTextBlock",
      toolCallId: "call_32334326",
      state: "output-available",
      input: {
        type: "text",
        label: "Poster Title",
        x: 640,
        y: 100,
        width: 800,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        text: "Forest Poster",
        color: "#228B22",
        fontSize: 48,
        lineHeight: 1.2,
        letterSpacing: 1,
        textAlign: "center",
        font: {
          family: "Arial",
          weight: "bold",
        },
      },
      output:
        'Successfully generated text block "Poster Title" with ID e5940f94-d27d-405a-82c0-0ab2b2a42d72.',
    };

    yield {
      type: "data-generate-text-block",
      id: "call_32334326",
      data: {
        "generate-text-block": {
          block: {
            id: "e5940f94-d27d-405a-82c0-0ab2b2a42d72",
            type: "text",
            label: "Poster Title",
            x: 640,
            y: 100,
            width: 800,
            height: 80,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            text: "Forest Poster",
            color: "#228B22",
            fontSize: 48,
            lineHeight: 1.2,
            letterSpacing: 1,
            textAlign: "center",
            font: {
              family: "Arial",
              weight: "bold",
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_35743726",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree4 Trunk",
        x: 150,
        y: 420,
        width: 35,
        height: 220,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_35743726",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree4 Trunk",
        x: 150,
        y: 420,
        width: 35,
        height: 220,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree4 Trunk" with ID 78d07737-78f3-4b2a-976c-4531c40dad0e.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_35743726",
      data: {
          block: {
            id: "78d07737-78f3-4b2a-976c-4531c40dad0e",
            type: "frame",
            label: "Tree4 Trunk",
            x: 150,
            y: 420,
            width: 35,
            height: 220,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_82522411",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree4 Leaves",
        x: 90,
        y: 230,
        width: 180,
        height: 180,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 90,
          tr: 90,
          br: 90,
          bl: 90,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_82522411",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree4 Leaves",
        x: 90,
        y: 230,
        width: 180,
        height: 180,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 90,
          tr: 90,
          br: 90,
          bl: 90,
        },
      },
      output:
        'Successfully generated frame block "Tree4 Leaves" with ID c24cc0c2-17e9-42ac-80de-f3811469e470.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_82522411",
      data: {
        "generate-frame-block": {
          block: {
            id: "c24cc0c2-17e9-42ac-80de-f3811469e470",
            type: "frame",
            label: "Tree4 Leaves",
            x: 90,
            y: 230,
            width: 180,
            height: 180,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 90,
              tr: 90,
              br: 90,
              bl: 90,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_82885072",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree5 Trunk",
        x: 900,
        y: 380,
        width: 30,
        height: 210,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_82885072",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree5 Trunk",
        x: 900,
        y: 380,
        width: 30,
        height: 210,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree5 Trunk" with ID 01b0fc5f-0204-44d5-9fc9-89c47c4d5a6d.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_82885072",
      data: {
          block: {
            id: "01b0fc5f-0204-44d5-9fc9-89c47c4d5a6d",
            type: "frame",
            label: "Tree5 Trunk",
            x: 900,
            y: 380,
            width: 30,
            height: 210,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_78500785",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree5 Leaves",
        x: 840,
        y: 240,
        width: 160,
        height: 160,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 80,
          tr: 80,
          br: 80,
          bl: 80,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_78500785",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree5 Leaves",
        x: 840,
        y: 240,
        width: 160,
        height: 160,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 80,
          tr: 80,
          br: 80,
          bl: 80,
        },
      },
      output:
        'Successfully generated frame block "Tree5 Leaves" with ID dcdf8b83-a796-48f4-a9ff-cc4c2afcb96d.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_78500785",
      data: {
        "generate-frame-block": {
          block: {
            id: "dcdf8b83-a796-48f4-a9ff-cc4c2afcb96d",
            type: "frame",
            label: "Tree5 Leaves",
            x: 840,
            y: 210,
            width: 160,
            height: 160,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 80,
              tr: 80,
              br: 80,
              bl: 80,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_67677292",
      state: "input-available",
      input: {
        type: "frame",
        label: "Ground",
        x: 0,
        y: 600,
        width: 1280,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#90EE90",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_67677292",
      state: "output-available",
      input: {
        type: "frame",
        label: "Ground",
        x: 0,
        y: 600,
        width: 1280,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#90EE90",
      },
      output:
        'Successfully generated frame block "Ground" with ID 521ce3cb-d8db-4098-99c2-1a79cb053808.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_67677292",
      data: {
          block: {
            id: "521ce3cb-d8db-4098-99c2-1a79cb053808",
            type: "frame",
            label: "Ground",
            x: 0,
            y: 600,
            width: 1280,
            height: 120,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#90EE90",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_18067922",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree6 Trunk",
        x: 1000,
        y: 400,
        width: 28,
        height: 190,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_18067922",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree6 Trunk",
        x: 1000,
        y: 400,
        width: 28,
        height: 190,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree6 Trunk" with ID f76280b1-1058-4e49-8e5f-4914f9a3f390.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_18067922",
      data: {
          block: {
            id: "f76280b1-1058-4e49-8e5f-4914f9a3f390",
            type: "frame",
            label: "Tree6 Trunk",
            x: 1000,
            y: 400,
            width: 28,
            height: 190,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_74591267",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree6 Leaves",
        x: 940,
        y: 260,
        width: 140,
        height: 140,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 70,
          tr: 70,
          br: 70,
          bl: 70,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_74591267",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree6 Leaves",
        x: 940,
        y: 260,
        width: 140,
        height: 140,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 70,
          tr: 70,
          br: 70,
          bl: 70,
        },
      },
      output:
        'Successfully generated frame block "Tree6 Leaves" with ID f1f82330-7cb9-44d1-a34a-e280c63cfaf4.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_74591267",
      data: {
        "generate-frame-block": {
          block: {
            id: "f1f82330-7cb9-44d1-a34a-e280c63cfaf4",
            type: "frame",
            label: "Tree6 Leaves",
            x: 940,
            y: 260,
            width: 140,
            height: 140,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 70,
              tr: 70,
              br: 70,
              bl: 70,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_38968303",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree7 Trunk",
        x: 200,
        y: 450,
        width: 32,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_38968303",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree7 Trunk",
        x: 200,
        y: 450,
        width: 32,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree7 Trunk" with ID 3e165fce-d0bf-4f6c-903d-594e5a038978.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_38968303",
      data: {
          block: {
            id: "3e165fce-d0bf-4f6c-903d-594e5a038978",
            type: "frame",
            label: "Tree7 Trunk",
            x: 200,
            y: 450,
            width: 32,
            height: 200,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_41849280",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree7 Leaves",
        x: 140,
        y: 310,
        width: 160,
        height: 160,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 80,
          tr: 80,
          br: 80,
          bl: 80,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_41849280",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree7 Leaves",
        x: 140,
        y: 310,
        width: 160,
        height: 160,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 80,
          tr: 80,
          br: 80,
          bl: 80,
        },
      },
      output:
        'Successfully generated frame block "Tree7 Leaves" with ID 0fe979b5-6821-4632-a25c-d7e84753f091.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_41849280",
      data: {
        "generate-frame-block": {
          block: {
            id: "0fe979b5-6821-4632-a25c-d7e84753f091",
            type: "frame",
            label: "Tree7 Leaves",
            x: 140,
            y: 310,
            width: 160,
            height: 160,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 80,
              tr: 80,
              br: 80,
              bl: 80,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_69577797",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree8 Trunk",
        x: 600,
        y: 420,
        width: 35,
        height: 210,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_69577797",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree8 Trunk",
        x: 600,
        y: 420,
        width: 35,
        height: 210,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#8B4513",
      },
      output:
        'Successfully generated frame block "Tree8 Trunk" with ID 432e74c5-f900-44ec-a473-effda7fd3297.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_69577797",
      data: {
          block: {
            id: "432e74c5-f900-44ec-a473-effda7fd3297",
            type: "frame",
            label: "Tree8 Trunk",
            x: 600,
            y: 420,
            width: 35,
            height: 210,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#8B4513",
          },
          status: "done", },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_62547575",
      state: "input-available",
      input: {
        type: "frame",
        label: "Tree8 Leaves",
        x: 540,
        y: 260,
        width: 170,
        height: 170,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 85,
          tr: 85,
          br: 85,
          bl: 85,
        },
      },
    };

    yield {
      type: "tool-generateFrameBlock",
      toolCallId: "call_62547575",
      state: "output-available",
      input: {
        type: "frame",
        label: "Tree8 Leaves",
        x: 540,
        y: 260,
        width: 170,
        height: 170,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#228B22",
        radius: {
          tl: 85,
          tr: 85,
          br: 85,
          bl: 85,
        },
      },
      output:
        'Successfully generated frame block "Tree8 Leaves" with ID b8328f36-5672-46a1-953f-325666e61565.',
    };

    yield {
      type: "data-generate-frame-block",
      id: "call_62547575",
      data: {
        "generate-frame-block": {
          block: {
            id: "b8328f36-5672-46a1-953f-325666e61565",
            type: "frame",
            label: "Tree8 Leaves",
            x: 540,
            y: 260,
            width: 170,
            height: 170,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            background: "#228B22",
            radius: {
              tl: 85,
              tr: 85,
              br: 85,
              bl: 85,
            },
          },
          status: "done",
        },
      },
    };

    yield {
      type: "step-start",
    };

    yield {
      type: "tool-generateTextBlock",
      toolCallId: "call_55605683",
      state: "input-available",
      input: {
        type: "text",
        label: "Poster Subtitle",
        x: 640,
        y: 130,
        width: 800,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        text: "A Majestic Forest Scene",
        color: "#228B22",
        fontSize: 24,
        lineHeight: 1.2,
        letterSpacing: 0.5,
        textAlign: "center",
        font: {
          family: "Arial",
          weight: "normal",
        },
      },
    };

    yield {
      type: "tool-generateTextBlock",
      toolCallId: "call_55605683",
      state: "output-available",
      input: {
        type: "text",
        label: "Poster Subtitle",
        x: 640,
        y: 130,
        width: 800,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        text: "A Majestic Forest Scene",
        color: "#228B22",
        fontSize: 24,
        lineHeight: 1.2,
        letterSpacing: 0.5,
        textAlign: "center",
        font: {
          family: "Arial",
          weight: "normal",
        },
      },
      output:
        'Successfully generated text block "Poster Subtitle" with ID b0161a80-7e2d-45bc-a4bf-ee38f767f53d.',
    };

    yield {
      type: "data-generate-text-block",
      id: "call_55605683",
      data: {
        "generate-text-block": {
          block: {
            id: "b0161a80-7e2d-45bc-a4bf-ee38f767f53d",
            type: "text",
            label: "Poster Subtitle",
            x: 640,
            y: 130,
            width: 800,
            height: 40,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            opacity: 100,
            text: "A Majestic Forest Scene",
            color: "#228B22",
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: 0.5,
            textAlign: "center",
            font: {
              family: "Arial",
              weight: "normal",
            },
          },
          status: "done",
        },
      },
    };
  },
});
