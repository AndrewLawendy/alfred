import { render, screen } from "@testing-library/react";

import { Eyebrow } from "components/PageHeader";

test("an eyebrow stays on one line, however long (an outfit's name)", () => {
  render(
    <Eyebrow>Today · Sun · A very long outfit name for a wedding day</Eyebrow>
  );
  expect(screen.getByText(/A very long outfit name/)).toHaveStyle({
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  });
});
