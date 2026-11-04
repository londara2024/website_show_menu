import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

// The theme toggle needs next-themes' provider; it isn't what this test is about.
vi.mock("@/components/theme/theme-toggle", () => ({ ThemeToggle: () => null }));

describe("<SiteHeader>", () => {
  it("the person icon opens the admin (the proxy sends logged-out visitors to /login first)", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "ផ្ទាំងគ្រប់គ្រង (ចូលគណនី)" })).toHaveAttribute("href", "/admin");
  });

  it("the logo links home", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "ទំព័រដើម CoffeeShop" })).toHaveAttribute("href", "/");
  });
});
