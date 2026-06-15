import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBanner from "./ErrorBanner";

describe("ErrorBanner", () => {
  it("does not render when there is no error message", () => {
    const { container } = render(
      <ErrorBanner message="" onDismiss={() => {}} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the error and dismisses it", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <ErrorBanner
        message="Unable to connect to the server"
        onDismiss={onDismiss}
      />
    );

    expect(
      screen.getByText("Something went wrong")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unable to connect to the server")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Dismiss error",
      })
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});