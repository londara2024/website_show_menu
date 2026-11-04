import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusSwitch } from "./status-switch";

describe("<StatusSwitch>", () => {
  it("shows the current state in Khmer", () => {
    render(<StatusSwitch active label="ឡាតេ" action={vi.fn()} />);
    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.getByText("កំពុងលក់")).toBeInTheDocument();
  });

  it("calls the action with the new value", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<StatusSwitch active label="ឡាតេ" action={action} />);

    await user.click(screen.getByRole("switch", { name: "បិទការលក់ ឡាតេ" }));

    await waitFor(() => expect(action).toHaveBeenCalledWith(false));
  });

  it("rolls back to the server value when the action fails", async () => {
    const action = vi.fn().mockRejectedValue(new Error("network"));
    const user = userEvent.setup();
    render(<StatusSwitch active={false} label="ឡាតេ" action={action} />);

    await user.click(screen.getByRole("switch"));

    await waitFor(() => expect(action).toHaveBeenCalledWith(true));
    await waitFor(() => expect(screen.getByRole("switch")).not.toBeChecked());
    expect(screen.getByText("បិទ")).toBeInTheDocument();
  });
});
