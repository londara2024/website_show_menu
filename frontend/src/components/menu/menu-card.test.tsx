import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MENU_ITEMS, type MenuItem } from "@/lib/menu-data";
import { MenuCard, isOptimizedHost } from "./menu-card";

// next/image needs the Next.js runtime config; a plain <img> is enough to test the card.
vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ fill, priority, unoptimized, alt, ...props }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={String(alt)} {...(props as object)} data-unoptimized={String(unoptimized)} />
  ),
}));

const americano = MENU_ITEMS.find((p) => p.id === "americano")!;

describe("<MenuCard>", () => {
  it("shows name, description, tag and badge", () => {
    render(<MenuCard item={americano} />);
    expect(screen.getByRole("heading", { name: "អាមេរិកាណូ" })).toBeInTheDocument();
    expect(screen.getByText(americano.description)).toBeInTheDocument();
    expect(screen.getByText("លីងខ្លាំង")).toBeInTheDocument();
    expect(screen.getByText("ពេញនិយមក្នុងហាង")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("alt", americano.imageAlt);
  });

  it("shows every size with USD and riel prices", () => {
    const { container } = render(<MenuCard item={americano} />);
    const card = within(container);
    for (const size of americano.sizes) expect(card.getByText(size.label)).toBeInTheDocument();
    expect(card.getByText("$2.00")).toBeInTheDocument();
    expect(card.getByText("$3.00")).toBeInTheDocument();
    expect(container).toHaveTextContent("8,200៛");
    expect(container).toHaveTextContent("12,300៛");
  });

  it("uses the live exchange rate for riel prices", () => {
    const { container } = render(<MenuCard item={americano} khrPerUsd={4000} />);
    expect(container).toHaveTextContent("8,000៛"); // $2.00 × 4,000
    expect(container).toHaveTextContent("12,000៛"); // $3.00 × 4,000
    expect(container).not.toHaveTextContent("8,200៛");
  });

  it("renders without a badge", () => {
    const noBadge: MenuItem = { ...americano, badge: undefined };
    render(<MenuCard item={noBadge} />);
    expect(screen.queryByText("ពេញនិយមក្នុងហាង")).not.toBeInTheDocument();
  });

  it("only optimises images from known hosts", () => {
    render(<MenuCard item={{ ...americano, image: "https://cdn.example.com/x.jpg" }} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-unoptimized", "true");
  });
});

describe("isOptimizedHost", () => {
  it.each([
    ["https://lh3.googleusercontent.com/aida-public/abc", true],
    ["/images/latte.jpg", true],
    ["https://cdn.example.com/x.jpg", false],
    ["http://lh3.googleusercontent.com/x", false],
    ["/uploads/0e8c1f9a-0000-4000-8000-000000000000.jpg", false], // admin uploads are served as-is
  ])("%s → %s", (src, expected) => {
    expect(isOptimizedHost(src)).toBe(expected);
  });
});
