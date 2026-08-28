import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(`${process.cwd()}/app/(tabs)/_layout.tsx`, "utf8");

describe("transisi navigator tab UMKM KU", () => {
  it("menonaktifkan fade yang dapat menampilkan kilatan putih saat berpindah tab", () => {
    expect(source).toContain('animation: "none"');
    expect(source).not.toContain('animation: "fade"');
  });

  it("memakai latar tema pada tab bar dan scene", () => {
    expect(source).toContain("backgroundColor: colors.background");
    expect(source).toContain("sceneStyle: { backgroundColor: colors.background }");
  });
});
