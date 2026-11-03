import { expect, test } from "@playwright/test";
import {
  addBook,
  createBook,
  deleteBook,
  expectBookInResponse,
  expectDeletedBook,
  expectUnder500Ms,
  getBook,
  timed,
  warmUp,
} from "../support/library-api";

test("creates, reads, deletes, and verifies two dynamically generated books", async ({ request }) => {
  const books = [createBook("CRUD Integration A"), createBook("CRUD Integration B")];
  const ids: string[] = [];

  try {
    await warmUp(request);
    for (const book of books) {
      const { result, durationMs } = await timed(() => addBook(request, book));
      expect(result.response.status()).toBe(200);
      expect(Object.keys(result.body).sort()).toEqual(["ID", "Msg"]);
      expect(typeof result.body.Msg).toBe("string");
      expect(typeof result.body.ID).toBe("string");
      expect(result.body.Msg).toBe("successfully added");
      expect(result.body.ID).toBe(`${book.isbn}${book.aisle}`);
      expectUnder500Ms(durationMs);
      ids.push(result.body.ID);
    }

    for (let index = 0; index < books.length; index += 1) {
      const { result, durationMs } = await timed(() => getBook(request, ids[index]));
      await expectBookInResponse(result, books[index]);
      expectUnder500Ms(durationMs);
    }

    for (const id of ids) {
      const { result, durationMs } = await timed(() => deleteBook(request, id));
      await expectDeletedBook(result);
      expectUnder500Ms(durationMs);
    }

    for (const id of ids) {
      const response = await getBook(request, id);
      expect(response.status()).toBe(404);
      await expect(response.json()).resolves.toEqual({
        msg: "The book by requested bookid / author name does not exists!",
      });
    }
  } finally {
    for (const id of ids) {
      await deleteBook(request, id);
    }
  }
});
