import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("shows Lakh for values under one crore", () => {
    expect(formatPrice(6500000)).toBe("₹65 Lakh");
  });
  it("shows Cr for values of one crore or more", () => {
    expect(formatPrice(12000000)).toBe("₹1.2 Cr");
  });
  it("adds per month for rentals", () => {
    expect(formatPrice(25000, "rent")).toBe("₹25,000/month");
  });
  it("shows price on request for zero", () => {
    expect(formatPrice(0)).toBe("Price on request");
  });
});
