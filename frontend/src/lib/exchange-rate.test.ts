// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BackendUnavailableError } from "./api";
import { getKhrPerUsd } from "./exchange-rate";

const apiFetch = vi.hoisted(() => vi.fn());
vi.mock("./api", async (importOriginal) => ({ ...(await importOriginal<typeof import("./api")>()), apiFetch }));
vi.mock("./authed-call", () => ({ asAdmin: vi.fn(), asViewer: vi.fn() }));

beforeEach(() => {
  apiFetch.mockReset();
});

describe("getKhrPerUsd", () => {
  it("returns the live rate from the public endpoint", async () => {
    apiFetch.mockResolvedValue({ khrPerUsd: 4050, updatedAt: "2026-11-04T00:00:00Z" });
    await expect(getKhrPerUsd()).resolves.toBe(4050);
    expect(apiFetch).toHaveBeenCalledWith("/api/exchange-rate");
  });

  it("falls back to 4,100 when the API is down, so prices still show", async () => {
    apiFetch.mockImplementation(async () => {
      throw new BackendUnavailableError(new Error("down"));
    });
    await expect(getKhrPerUsd()).resolves.toBe(4100);
  });
});
