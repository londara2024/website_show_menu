import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminActionLink, StatusBadge, ViewOnlyNotice } from "./admin-access";
import { AdminNotice, AdminPageHeader, StatCard } from "./admin-ui";

describe("<AdminNotice>", () => {
  it.each([
    ["created", "បានបន្ថែមដោយជោគជ័យ។"],
    ["updated", "បានរក្សាទុកការកែប្រែ។"],
  ])("shows the %s banner", (notice, text) => {
    render(<AdminNotice notice={notice} />);
    expect(screen.getByRole("status")).toHaveTextContent(text);
  });

  it.each([undefined, "bogus", ["created"]])("renders nothing for %j", (notice) => {
    const { container } = render(<AdminNotice notice={notice as string | undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("<AdminPageHeader>", () => {
  it("renders the title and whatever is passed as the action", () => {
    render(<AdminPageHeader title="ផលិតផល" subtitle="គ្រប់គ្រង" action={<AdminActionLink href="/admin/products/new" label="បន្ថែមផលិតផល" />} />);
    expect(screen.getByRole("heading", { level: 1, name: "ផលិតផល" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "បន្ថែមផលិតផល" })).toHaveAttribute("href", "/admin/products/new");
  });

  it("works without an action", () => {
    render(<AdminPageHeader title="កែប្រែ" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("<StatCard>", () => {
  it("shows the label and value", () => {
    render(<StatCard label="សរុប" value={8} />);
    expect(screen.getByText("សរុប")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});

describe("view-only pieces", () => {
  it("<StatusBadge> shows the state as read-only text", () => {
    const { rerender } = render(<StatusBadge active />);
    expect(screen.getByText("កំពុងលក់")).toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    rerender(<StatusBadge active={false} />);
    expect(screen.getByText("បិទ")).toBeInTheDocument();
  });

  it("<ViewOnlyNotice> explains the limit and links back to the list", () => {
    render(<ViewOnlyNotice />);
    expect(screen.getByRole("heading", { name: "មិនមានសិទ្ធិកែប្រែ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ត្រឡប់ទៅបញ្ជី" })).toHaveAttribute("href", "/admin");
  });
});
