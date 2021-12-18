import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { useSession } from "next-auth/client";
import { SignInButton } from ".";

jest.mock("next-auth/client");

describe("SignInButton component", () => {
  it("should be able to renders correctly when user is not authenticated", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />);

    // best way to verify
    expect(screen.getByText("Sign in with Github")).toBeInTheDocument();
  });

  it("should be able to renders correctly when user is authenticated", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: "John Doe", email: "john.doe@gmail.com" },
        expires: "fake-expires",
      },
      false,
    ]);

    render(<SignInButton />);

    // best way to verify
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
