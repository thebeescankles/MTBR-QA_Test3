import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { randomInt } from "node:crypto";
import { performance } from "node:perf_hooks";

export interface Book {
  name: string;
  isbn: string;
  aisle: string;
  author: string;
}

export interface AddBookResponse {
  Msg: string;
  ID: string;
}

export interface GetBookResponse {
  book_name: string;
  isbn: string;
  aisle: string;
  author: string;
}

export interface MessageResponse {
  msg: string;
}

const responseTimeLimitMs = 500;

export function createBook(label = "Functional Testing"): Book {
  const isbn = randomInt(10_000, 100_000).toString();
  const aisle = randomInt(10_000, 100_000).toString();

  return {
    name: `${label} ${Date.now()}-${isbn}${aisle}`,
    isbn,
    aisle,
    author: "Playwright QA",
  };
}

export async function timed<T>(operation: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await operation();
  return { result, durationMs: performance.now() - start };
}

export function expectUnder500Ms(durationMs: number): void {
  expect(durationMs, `response time was ${durationMs.toFixed(2)} ms`).toBeLessThan(responseTimeLimitMs);
}

export async function addBook(
  request: APIRequestContext,
  book: Book,
): Promise<{ response: APIResponse; body: AddBookResponse }> {
  const response = await request.post("Addbook.php", { data: book });
  expect(response.status(), await response.text()).toBe(200);
  const body = (await response.json()) as AddBookResponse;
  return { response, body };
}

export async function createBookAndGetId(request: APIRequestContext, book = createBook()): Promise<string> {
  const { response, body } = await addBook(request, book);
  expect(response.status()).toBe(200);
  expect(body.ID).toBe(`${book.isbn}${book.aisle}`);
  return body.ID;
}

export async function deleteBook(request: APIRequestContext, id: string): Promise<APIResponse> {
  return request.post("DeleteBook.php", { data: { ID: id } });
}

export async function getBook(request: APIRequestContext, id: string): Promise<APIResponse> {
  return request.get("GetBook.php", { params: { ID: id } });
}

export async function warmUp(request: APIRequestContext): Promise<void> {
  const response = await getBook(request, `warmup-${Date.now()}`);
  expect(response.status()).toBe(404);
}

export async function expectBookInResponse(response: APIResponse, book: Book): Promise<void> {
  expect(response.status()).toBe(200);
  const body = (await response.json()) as GetBookResponse[];
  expect(Array.isArray(body)).toBe(true);
  expect(body).toHaveLength(1);
  expect(body[0]).toEqual({
    book_name: book.name,
    isbn: book.isbn,
    aisle: book.aisle,
    author: book.author,
  });
  for (const value of Object.values(body[0])) {
    expect(typeof value).toBe("string");
  }
}

export async function expectDeletedBook(response: APIResponse): Promise<void> {
  expect(response.status()).toBe(200);
  const body = (await response.json()) as MessageResponse;
  expect(Object.keys(body).sort()).toEqual(["msg"]);
  expect(typeof body.msg).toBe("string");
  expect(body.msg).toBe("book is successfully deleted");
}
