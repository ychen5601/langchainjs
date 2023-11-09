/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { test, expect } from "@jest/globals";
import { Bedrock } from "../bedrock/index.js";

test("Test Bedrock LLM: AI21", async () => {
  const region = process.env.BEDROCK_AWS_REGION!;
  const model = "ai21.j2-grande-instruct";
  const prompt = "Human: What is your name?";

  const bedrock = new Bedrock({
    maxTokens: 20,
    region,
    model,
    maxRetries: 0,
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
  });

  const res = await bedrock.call(prompt);
  expect(typeof res).toBe("string");

  console.log(res);
});

test("Test Bedrock LLM: Claude-v2", async () => {
  const region = process.env.BEDROCK_AWS_REGION!;
  const model = "anthropic.claude-v2";
  const prompt = "Human: What is your name?\n\nAssistant:";

  const bedrock = new Bedrock({
    maxTokens: 20,
    region,
    model,
    maxRetries: 0,
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
  });

  const res = await bedrock.call(prompt);
  expect(typeof res).toBe("string");
  console.log(res);
});

test("Test Bedrock LLM streaming: AI21", async () => {
  const region = process.env.BEDROCK_AWS_REGION!;
  const model = "ai21.j2-grande-instruct";
  const prompt = "Human: What is your name?";

  const bedrock = new Bedrock({
    maxTokens: 20,
    region,
    model,
    maxRetries: 0,
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
  });

  const stream = await bedrock.stream(prompt);
  const chunks = [];
  for await (const chunk of stream) {
    console.log(chunk);
    chunks.push(chunk);
  }
  expect(chunks.length).toEqual(1);
});

test("Test Bedrock LLM handleLLMNewToken: Claude-v2", async () => {
  const region = process.env.BEDROCK_AWS_REGION!;
  const model = "anthropic.claude-v2";
  const prompt = "Human: What is your name?\n\nAssistant:";
  const tokens: string[] = [];

  const bedrock = new Bedrock({
    maxTokens: 20,
    region,
    model,
    maxRetries: 0,
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token) {
          tokens.push(token);
        },
      },
    ],
  });

  const stream = await bedrock.call(prompt);
  expect(tokens.length).toBeGreaterThan(1);
  expect(stream).toEqual(tokens.join(""));
});

test("Test Bedrock LLM streaming: Claude-v2", async () => {
  const region = process.env.BEDROCK_AWS_REGION!;
  const model = "anthropic.claude-v2";
  const prompt = "Human: What is your name?\n\nAssistant:";

  const bedrock = new Bedrock({
    maxTokens: 20,
    region,
    model,
    maxRetries: 0,
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
  });

  const stream = await bedrock.stream(prompt);
  const chunks = [];
  for await (const chunk of stream) {
    console.log(chunk);
    chunks.push(chunk);
  }
  expect(chunks.length).toBeGreaterThan(1);
});
