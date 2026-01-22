import { describe, it, expect} from "vitest";

describe("sum module", () => {
    it("should sum two numbers correctly", () => {
        const sum = (a: number, b: number): number => a + b;
        expect(sum(2, 3)).toBe(5);
    });
});