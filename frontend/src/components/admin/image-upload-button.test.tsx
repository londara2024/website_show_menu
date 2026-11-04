import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageUploadButton } from "./image-upload-button";

const file = () => new File(["png-bytes"], "latte.png", { type: "image/png" });

describe("<ImageUploadButton>", () => {
  it("uploads the picked file and reports the stored URL", async () => {
    const upload = vi.fn().mockResolvedValue({ url: "/uploads/abc.png" });
    const onUploaded = vi.fn();
    const user = userEvent.setup();
    render(<ImageUploadButton upload={upload} onUploaded={onUploaded} />);

    await user.upload(screen.getByTestId("image-file"), file());

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith("/uploads/abc.png"));
    const sent = upload.mock.calls[0][0] as FormData;
    expect((sent.get("file") as File).name).toBe("latte.png");
  });

  it("shows the Khmer error and doesn't report a URL when the upload is rejected", async () => {
    const upload = vi.fn().mockResolvedValue({ error: "រូបភាពធំពេក (អតិបរមា 5MB)។" });
    const onUploaded = vi.fn();
    const user = userEvent.setup();
    render(<ImageUploadButton upload={upload} onUploaded={onUploaded} />);

    await user.upload(screen.getByTestId("image-file"), file());

    expect(await screen.findByRole("alert")).toHaveTextContent("រូបភាពធំពេក");
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("the visible button opens the file picker", async () => {
    const user = userEvent.setup();
    render(<ImageUploadButton upload={vi.fn()} onUploaded={vi.fn()} />);
    const picker = screen.getByTestId("image-file");
    const click = vi.spyOn(picker, "click");

    await user.click(screen.getByRole("button", { name: "បង្ហោះរូបភាព" }));

    expect(click).toHaveBeenCalled();
    expect(picker).toHaveAttribute("accept", "image/jpeg,image/png,image/webp,image/gif");
  });
});
