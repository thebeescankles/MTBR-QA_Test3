import { expect, test } from "@playwright/test";
import {
  createBook,
  createBookAndGetId,
  deleteBook,
  expectBookInResponse,
  expectUnder500Ms,
  getBook,
  timed,
} from "../support/library-api";

test.describe("GET /GetBook.php", () => {
  test("returns an existing book with the documented structure", async ({ request }) => {
    const book = createBook();
    const id = await createBookAndGetId(request, book);

    try {
      const { result, durationMs } = await timed(() => getBook(request, id));
      await expectBookInResponse(result, book);
      expectUnder500Ms(durationMs);
    } finally {
      await deleteBook(request, id);
    }
  });

  test("returns the documented not-found status and message", async ({ request }) => {
    const missingId = `missing-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const response = await getBook(request, missingId);

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({
      msg: "The book by requested bookid / author name does not exists!",
    });
  });
});
