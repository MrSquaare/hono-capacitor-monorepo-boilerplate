import { partyserverMiddleware } from "hono-party";
import { vi } from "vitest";

vi.mock("hono-party", async (importOriginal) => {
  const mod = await importOriginal<typeof import("hono-party")>();

  return {
    ...mod,
    partyserverMiddleware: vi.fn(),
  };
});

export const mockedPartyServerMiddleware = vi.mocked(partyserverMiddleware);
