import { render } from "@testing-library/react";

jest.mock("./api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

import App from "./App";

test("renders the app without crashing", () => {
  render(<App />);
});