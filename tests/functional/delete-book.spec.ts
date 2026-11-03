import { expect, test } from "@playwright/test";
import {
  createBook,
  createBookAndGetId,
  deleteBook,
  expectDeletedBook,
  expectUnder500Ms,
  timed,
} from "../support/library-api";

test.describe("POST /DeleteBook.php", () => {
  test("deletes an existing book and returns the documented structure", async ({ request }) => {
    const id = await createBookAndGetId(request, createBook("Delete Functional"));
    const { result, durationMs } = await timed(() => deleteBook(request, id));

    await expectDeletedBook(result);
    expectUnder500Ms(durationMs);
  });

  test("returns the documented not-found status and message", async ({ request }) => {
    const missingId = `missing-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const response = await deleteBook(request, missingId);

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({
      msg: "Delete Book operation failed, looks like the book doesnt exists",
    });
  });
});
