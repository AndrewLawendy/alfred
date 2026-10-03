import { render, screen } from "@testing-library/react";

import HamperCard from "components/HamperSheet/HamperCard";

const piece = (id: string, lastWornOn: string) => ({
  id,
  type: "shirt" as const,
  wears: 1,
  lastWornOn,
});

test("an empty hamper shows no card", () => {
  const { container } = render(<HamperCard pieces={[]} onOpen={() => {}} />);
  expect(container.textContent).toBe("");
});

test("the card counts the hamper and names the oldest day, and opens it", () => {
  let opened = false;
  render(
    <HamperCard
      pieces={[piece("a", "2026-09-28"), piece("b", "2026-10-02")]}
      onOpen={() => (opened = true)}
      today="2026-10-03"
    />
  );
  const card = screen.getByRole("button");
  expect(card.textContent).toContain("2 pieces in the hamper");
  expect(card.textContent).toContain("Oldest since Mon");
  card.click();
  expect(opened).toBe(true);
});

test("one piece reads in the singular", () => {
  render(
    <HamperCard
      pieces={[piece("a", "2026-10-02")]}
      onOpen={() => {}}
      today="2026-10-03"
    />
  );
  expect(screen.getByRole("button").textContent).toContain(
    "1 piece in the hamper"
  );
});
