import { expect, test } from "@playwright/test";
import {
  addBook,
  createBook,
  deleteBook,
  expectUnder500Ms,
  timed,
  warmUp,
} from "../support/library-api";

test.describe("POST /Addbook.php", () => {
  test("adds a book with the documented response and a concatenated ID", async ({ request }) => {
    const book = createBook();
    await warmUp(request);
    const { result, durationMs } = await timed(() => addBook(request, book));

    try {
      expect(result.response.status()).toBe(200);
      expect(Object.keys(result.body).sort()).toEqual(["ID", "Msg"]);
      expect(typeof result.body.Msg).toBe("string");
      expect(typeof result.body.ID).toBe("string");
      expect(result.body.Msg).toBe("successfully added");
      expect(result.body.ID).toBe(`${book.isbn}${book.aisle}`);
      expectUnder500Ms(durationMs);
    } finally {
      if (result.response.ok() && result.body.ID) {
        await deleteBook(request, result.body.ID);
      }
    }
  });

  test("rejects a non-numeric aisle with HTTP 500", async ({ request }) => {
    const response = await request.post("Addbook.php", {
      data: { ...createBook("Invalid Aisle"), aisle: "abc" },
    });

    expect(response.status()).toBe(500);
  });
});
