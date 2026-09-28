import { render, screen } from "@testing-library/react";
import App from "./App";

test("a signed-out visitor lands on sign-in", async () => {
  render(<App />);
  expect(
    await screen.findByRole("button", { name: /continue with google/i })
  ).toBeInTheDocument();
});
