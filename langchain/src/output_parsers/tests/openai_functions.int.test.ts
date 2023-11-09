/* eslint-disable @typescript-eslint/no-explicit-any */

import { expect, test } from "@jest/globals";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "../../chat_models/openai.js";
import { ChatPromptTemplate } from "../../prompts/index.js";
import { JsonOutputFunctionsParser } from "../openai_functions.js";
import { Operation, applyPatch } from "../../util/fast-json-patch/index.js";

const schema = z.object({
  setup: z.string().describe("The setup for the joke"),
  punchline: z.string().describe("The punchline to the joke"),
});

const modelParams = {
  functions: [
    {
      name: "joke",
      description: "A joke",
      parameters: zodToJsonSchema(schema),
    },
  ],
  function_call: { name: "joke" },
};

test("Streaming JSON patch", async () => {
  const prompt = ChatPromptTemplate.fromTemplate(
    `tell me a long joke about {foo}`
  );
  const model = new ChatOpenAI({
    temperature: 0,
  }).bind(modelParams);

  const parser = new JsonOutputFunctionsParser({ diff: true });
  const chain = prompt.pipe(model).pipe(parser);

  const stream = await chain.stream({
    foo: "bears",
  });

  const chunks = [];
  let aggregate: any = {};
  for await (const chunk of stream) {
    console.log(chunk);
    chunks.push(chunk);
    aggregate = applyPatch(aggregate, chunk as Operation[]).newDocument;
  }

  expect(chunks.length).toBeGreaterThan(1);
  console.log(aggregate);
  expect(aggregate.setup.length).toBeGreaterThan(1);
  expect(aggregate.punchline.length).toBeGreaterThan(1);
});

test("Streaming aggregated JSON", async () => {
  const prompt = ChatPromptTemplate.fromTemplate(
    `tell me a long joke about {foo}`
  );
  const model = new ChatOpenAI({
    temperature: 0,
  }).bind(modelParams);

  const parser = new JsonOutputFunctionsParser();
  const chain = prompt.pipe(model).pipe(parser);

  const stream = await chain.stream({
    foo: "bears",
  });

  const chunks = [];
  let aggregate: any = {};
  for await (const chunk of stream) {
    console.log(chunk);
    chunks.push(chunk);
    aggregate = chunk;
  }

  expect(chunks.length).toBeGreaterThan(1);
  console.log(aggregate);
  expect(aggregate.setup.length).toBeGreaterThan(1);
  expect(aggregate.punchline.length).toBeGreaterThan(1);
});
