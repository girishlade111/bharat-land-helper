import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Index from "../pages/Index";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Bharat Land Converter — Functional UI & Workflow Tests", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("1. Renders complete converter with default state (1 Acre -> 40 Guntha MH)", async () => {
    renderWithRouter(<Index />);

    // Verify main headings and titles
    expect(screen.getByText(/Indian Land Area Converter|भूमि क्षेत्रफल रूपांतरण/)).toBeInTheDocument();

    // Verify default value is 1
    const input = screen.getByLabelText(/Enter area value|क्षेत्रफल दर्ज करें/);
    expect(input).toHaveValue("1");

    // Converted value in primary showcase should show 40 (1 Acre = 40 Guntha)
    const resultVal = screen.getByTestId("primary-result-value");
    expect(resultVal.textContent).toBe("40");

    const unitLabel = screen.getByTestId("primary-unit-label");
    expect(unitLabel.textContent).toContain("Guntha");
  });

  it("2. Entering a numeric value updates the conversion in real time", async () => {
    renderWithRouter(<Index />);

    const input = screen.getByLabelText(/Enter area value|क्षेत्रफल दर्ज करें/);
    fireEvent.change(input, { target: { value: "2.5" } });
    expect(input).toHaveValue("2.5");

    // 2.5 Acres = 100 Guntha (MH)
    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("100");
    });
  });

  it("3. Unit Swap Button exchanges From and To units without losing value", async () => {
    renderWithRouter(<Index />);

    const input = screen.getByLabelText(/Enter area value|क्षेत्रफल दर्ज करें/);
    fireEvent.change(input, { target: { value: "40" } });

    // Initial: 40 Acre = 1,600 Guntha
    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("1,600");
    });

    // Click Swap button
    const swapBtn = screen.getByLabelText(/Swap Units|इकाइयाँ आपस में बदलें/);
    fireEvent.click(swapBtn);

    // After swap: 40 Guntha = 1 Acre
    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("1");
      // Input value 40 should be preserved!
      expect(input).toHaveValue("40");
    });
  });

  it("4. Input validation rejects negative values with an explicit message", async () => {
    renderWithRouter(<Index />);

    const input = screen.getByLabelText(/Enter area value|क्षेत्रफल दर्ज करें/);
    fireEvent.change(input, { target: { value: "-5" } });

    // Should display validation error and hide primary result
    await waitFor(() => {
      expect(
        screen.getByText(/Physical land area cannot be negative|भूमि का क्षेत्रफल ऋणात्मक नहीं हो सकता/),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("primary-result-value")).not.toBeInTheDocument();
    });
  });

  it("5. Zero input converts cleanly without crashing or displaying '0.000000'", async () => {
    renderWithRouter(<Index />);

    const input = screen.getByLabelText(/Enter area value|क्षेत्रफल दर्ज करें/);
    fireEvent.change(input, { target: { value: "0" } });

    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("0");
      expect(screen.queryByText("0.000000")).not.toBeInTheDocument();
    });
  });

  it("6. Decimal preservation: values >= 100 retain fractional decimals", async () => {
    renderWithRouter(<Index />);

    const input = screen.getByLabelText(/Enter area value|क्षेत्रफल दर्ज करें/);
    // 2.75 Acres = 110 Guntha
    fireEvent.change(input, { target: { value: "2.75" } });

    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("110");
    });

    // 2.755 Acres = 110.2 Guntha
    fireEvent.change(input, { target: { value: "2.755" } });

    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("110.2");
    });
  });

  it("7. Interactive Unit Search allows finding and converting to arbitrary units", async () => {
    renderWithRouter(<Index />);

    const searchInput = screen.getByPlaceholderText(/Search unit|इकाई खोजें/);
    fireEvent.change(searchInput, { target: { value: "marla" } });

    // Search results should appear
    await waitFor(() => {
      expect(screen.getAllByText(/Marla \(PB \/ HR \/ HP \/ JK\)/).length).toBeGreaterThan(0);
    });

    // Click 'Convert To' button on search result
    const convertToButtons = screen.getAllByRole("button", { name: /Convert To/ });
    fireEvent.click(convertToButtons[0]);

    // 1 Acre = 160 Marla
    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("160");
      expect(screen.getByTestId("primary-unit-label").textContent).toContain("Marla");
    });
  });

  it("8. Clicking a card in the Results Grid sets it as the active target unit", async () => {
    renderWithRouter(<Index />);

    // Find the Square Feet card in results grid
    const sqftCard = screen.getByLabelText(/Square Feet \(sq ft\): 43,560/);
    fireEvent.click(sqftCard);

    // Primary target unit is now Square Feet
    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("43,560");
      expect(screen.getByTestId("primary-unit-label").textContent).toContain("Square Feet");
    });
  });

  it("9. Changing precision toggles decimal digits", async () => {
    renderWithRouter(<Index />);

    const input = screen.getByLabelText(/Enter area value|क्षेत्रफल दर्ज करें/);
    // 0.333333 Acre * 40 Guntha/Acre = 13.33332 Guntha
    fireEvent.change(input, { target: { value: "0.333333" } });

    // Initial default precision 4 -> "13.3333"
    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("13.3333");
    });

    // Click .2 precision button
    const p2Btn = screen.getByRole("button", { name: "2 decimal places" });
    fireEvent.click(p2Btn);

    await waitFor(() => {
      expect(screen.getByTestId("primary-result-value").textContent).toBe("13.33");
    });
  });

  it("10. Language switch toggles UI between English and Hindi", async () => {
    renderWithRouter(<Index />);

    const langBtn = screen.getByRole("button", { name: /Switch language/ });
    fireEvent.click(langBtn);

    // Header and UI should display Hindi labels
    await waitFor(() => {
      expect(screen.getByText("भूमि क्षेत्रफल रूपांतरण")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });
});
