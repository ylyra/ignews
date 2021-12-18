import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";

import { stripe } from "../../services/stripe";
import Home, { getStaticProps } from "../../pages";

jest.mock("next/router");
jest.mock("next-auth/client", () => {
  return {
    useSession: () => [null, false],
  };
});
jest.mock("../../services/stripe");

describe("Home page", () => {
  it("should render the home page correctly", () => {
    render(<Home product={{ priceId: "price-id", amount: "R$10,00" }} />);
    expect(screen.getByText("for R$10,00 month")).toBeInTheDocument();
  });

  it("should load initial data", async () => {
    const retriveStripePricesMocked = mocked(stripe.prices.retrieve);
    retriveStripePricesMocked.mockResolvedValueOnce({
      id: "fake-price-id",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: "fake-price-id",
            amount: "$10.00",
          },
        },
      })
    );
  });
});
