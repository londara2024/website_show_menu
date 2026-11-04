import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteButton } from "./delete-button";

describe("<DeleteButton>", () => {
  it("asks for confirmation before deleting", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<DeleteButton label="កាហ្វេឡាតេ" action={action} />);

    await user.click(screen.getByRole("button", { name: "លុប កាហ្វេឡាតេ" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "លុប" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "បោះបង់" })).toBeInTheDocument();
  });

  it("deletes on the second click", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<DeleteButton label="កាហ្វេឡាតេ" action={action} />);

    await user.click(screen.getByRole("button", { name: "លុប កាហ្វេឡាតេ" }));
    await user.click(screen.getByRole("button", { name: "លុប" }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
  });

  it("cancel goes back without deleting", async () => {
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeleteButton label="កាហ្វេឡាតេ" action={action} />);

    await user.click(screen.getByRole("button", { name: "លុប កាហ្វេឡាតេ" }));
    await user.click(screen.getByRole("button", { name: "បោះបង់" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "លុប កាហ្វេឡាតេ" })).toBeInTheDocument();
  });
});
