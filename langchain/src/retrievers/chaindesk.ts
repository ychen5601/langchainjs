import { BaseRetriever, type BaseRetrieverInput } from "../schema/retriever.js";
import { Document } from "../document.js";
import { AsyncCaller, type AsyncCallerParams } from "../util/async_caller.js";

export interface ChaindeskRetrieverArgs
  extends AsyncCallerParams,
    BaseRetrieverInput {
  datastoreId: string;
  topK?: number;
  apiKey?: string;
}

interface Berry {
  text: string;
  score: number;
  source?: string;
  [key: string]: unknown;
}

export class ChaindeskRetriever extends BaseRetriever {
  static lc_name() {
    return "ChaindeskRetriever";
  }

  lc_namespace = ["langchain", "retrievers", "chaindesk"];

  caller: AsyncCaller;

  datastoreId: string;

  topK?: number;

  apiKey?: string;

  constructor({ datastoreId, apiKey, topK, ...rest }: ChaindeskRetrieverArgs) {
    super();

    this.caller = new AsyncCaller(rest);
    this.datastoreId = datastoreId;
    this.apiKey = apiKey;
    this.topK = topK;
  }

  async getRelevantDocuments(query: string): Promise<Document[]> {
    const r = await this.caller.call(
      fetch,
      `https://app.chaindesk.ai/api/datastores/${this.datastoreId}/query`,
      {
        method: "POST",
        body: JSON.stringify({
          query,
          ...(this.topK ? { topK: this.topK } : {}),
        }),
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
      }
    );

    const { results } = (await r.json()) as { results: Berry[] };

    return results.map(
      ({ text, score, source, ...rest }) =>
        new Document({
          pageContent: text,
          metadata: {
            score,
            source,
            ...rest,
          },
        })
    );
  }
}
