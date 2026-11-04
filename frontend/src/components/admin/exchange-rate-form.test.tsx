import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExchangeRateForm } from "./exchange-rate-form";

describe("<ExchangeRateForm>", () => {
  it("starts with the current rate and previews prices", () => {
    render(<ExchangeRateForm action={vi.fn()} current={4100} />);
    expect(screen.getByLabelText("អត្រា (រៀល ក្នុង 1 ដុល្លារ)")).toHaveValue("4100");
    expect(screen.getByText("4,100៛")).toBeInTheDocument(); // $1.00
    expect(screen.getByText("1$ = 4,100៛", { exact: false })).toBeInTheDocument();
  });

  it("updates the preview as the admin types", async () => {
    const user = userEvent.setup();
    render(<ExchangeRateForm action={vi.fn()} current={4100} />);
    const input = screen.getByLabelText("អត្រា (រៀល ក្នុង 1 ដុល្លារ)");

    await user.clear(input);
    await user.type(input, "4000");
    expect(screen.getByText("10,000៛")).toBeInTheDocument(); // $2.50 × 4,000

    await user.clear(input);
    await user.type(input, "12");
    expect(screen.getAllByText("—")).toHaveLength(4); // out of range → no preview
  });
});
