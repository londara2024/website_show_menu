import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Lock, Mail } from "lucide-react";
import { describe, expect, it } from "vitest";
import { FormField } from "./form-field";

describe("<FormField>", () => {
  it("links the label and shows an accessible error", () => {
    render(<FormField id="email" name="email" label="អ៊ីមែល" icon={Mail} error="អ៊ីមែលមិនត្រឹមត្រូវ" />);

    const input = screen.getByLabelText("អ៊ីមែល");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("អ៊ីមែលមិនត្រឹមត្រូវ");
  });

  it("is valid when there is no error", () => {
    render(<FormField id="email" name="email" label="អ៊ីមែល" icon={Mail} />);
    expect(screen.getByLabelText("អ៊ីមែល")).toHaveAttribute("aria-invalid", "false");
  });

  it("password fields can be shown and hidden", async () => {
    const user = userEvent.setup();
    render(<FormField id="pw" name="pw" type="password" label="ពាក្យសម្ងាត់" icon={Lock} />);
    const input = screen.getByLabelText("ពាក្យសម្ងាត់");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "បង្ហាញពាក្យសម្ងាត់" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "លាក់ពាក្យសម្ងាត់" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("non-password fields have no show/hide button", () => {
    render(<FormField id="email" name="email" label="អ៊ីមែល" icon={Mail} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
