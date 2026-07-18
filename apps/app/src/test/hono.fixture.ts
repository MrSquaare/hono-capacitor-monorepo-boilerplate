import type { ClientResponse } from "hono/client";
import type { Mocked } from "vitest";

import { vi } from "vitest";

export type MockedResponse<
  TJson = unknown,
  TStatus extends number = number,
> = Mocked<ClientResponse<TJson, TStatus, "json">>;

export const createMockedResponse = <
  TJson = unknown,
  TStatus extends number = number,
>(options?: {
  json?: TJson;
  status?: TStatus;
  text?: string;
}): MockedResponse<TJson, TStatus> => {
  const status = options?.status ?? 200;
  const json = options?.json;
  const text = options?.text;

  const jsonSpy = vi.fn();
  const textSpy = vi.fn();

  if (json !== undefined) {
    jsonSpy.mockResolvedValueOnce(json);
    textSpy.mockImplementationOnce(async () => JSON.stringify(json));
  } else if (text !== undefined) {
    textSpy.mockResolvedValueOnce(text);
    jsonSpy.mockImplementationOnce(async () => JSON.parse(text));
  }

  const response = {
    json: jsonSpy,
    ok: status >= 200 && status < 300,
    status: status,
    text: textSpy,
  };

  return response as unknown as MockedResponse<TJson, TStatus>;
};
