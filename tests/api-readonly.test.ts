import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("read-only API", () => {
  it("returns health status", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "success",
      message: "OK",
    });
  });

  it("returns supported levels", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api/v1/levels" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "success",
      message: "Success",
      data: ["n5", "n4", "n3"],
    });
  });

  it("serves OpenAPI JSON docs", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api-docs/json" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      openapi: "3.0.0",
      info: {
        title: "JLPT Foundation API",
      },
    });
    expect(body.paths).toHaveProperty("/api/v1/kanji");
    expect(body.paths).toHaveProperty("/api/v1/quizzes/pool");
    expect(body.paths).toHaveProperty("/api/v1/quizzes/generate");
  });

  it("serves Swagger UI", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api-docs" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("Swagger UI");
  });

  it("lists kanji by level and optional week/day filters", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api/v1/kanji?level=n5&week=1&day=1" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toHaveLength(10);
    expect(body.paginate).toEqual({
      currentPage: 1,
      lastPage: 2,
      size: 10,
      from: 1,
      to: 10,
      total: 16,
    });
    expect(body.data[0]).toMatchObject({
      id: "n5-kanji-u5148",
      level: "n5",
      character: "先",
    });
  });

  it("returns a kanji item by ID", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api/v1/kanji/n5-kanji-u5148" });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({
      id: "n5-kanji-u5148",
      character: "先",
      meaning: {
        en: "previous, ahead, before",
        id: "sebelumnya, depan, lebih dulu",
      },
    });
  });

  it("returns 404 for missing kanji item", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api/v1/kanji/n5-kanji-missing" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      status: "failed",
      message: "Kanji item not found: n5-kanji-missing",
    });
  });

  it("lists dataset-backed quiz pool items", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api/v1/quizzes/pool?level=n5&section=kanji" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toHaveLength(10);
    expect(body.paginate).toEqual({
      currentPage: 1,
      lastPage: 11,
      size: 10,
      from: 1,
      to: 10,
      total: 108,
    });
    expect(body.data[0]).toMatchObject({
      level: "n5",
      section: "kanji",
      generationMode: "dataset",
      metadata: {
        quizType: "meaning",
      },
    });
  });

  it("supports pagination for quiz pool items", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/quizzes/pool?level=n5&section=kanji&page=2&size=10",
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toHaveLength(10);
    expect(body.paginate).toEqual({
      currentPage: 2,
      lastPage: 11,
      size: 10,
      from: 11,
      to: 20,
      total: 108,
    });
  });

  it("generates a dataset-backed quiz", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/quizzes/generate",
      payload: {
        level: "n5",
        section: "kanji",
        count: 5,
        generationMode: "dataset",
        quizType: ["meaning"],
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toMatchObject({
      level: "n5",
      section: "kanji",
      generationMode: "dataset",
      quizTypes: ["meaning"],
    });
    expect(body.data.questions).toHaveLength(5);
    expect(body.data.questions[0]).toMatchObject({
      section: "kanji",
      generationMode: "dataset",
      quizType: "meaning",
      isAiGenerated: false,
      isVerified: true,
    });
    expect(
      body.data.questions.every((question: { prompt: string }) => Array.from(question.prompt).length === 1),
    ).toBe(true);
    expect(body.data.questions[0].choices.length).toBeGreaterThanOrEqual(2);
  });

  it("narrows dataset quiz generation to meaning questions", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/quizzes/generate",
      payload: {
        level: "n5",
        section: "kanji",
        count: 5,
        generationMode: "dataset",
        quizType: ["meaning", "reading", "compound"],
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toMatchObject({
      generationMode: "dataset",
      quizTypes: ["meaning"],
    });
    expect(
      body.data.questions.every((question: { quizType: string }) => question.quizType === "meaning"),
    ).toBe(true);
  });

  it("accepts AI quiz generation contract but requires provider configuration", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/quizzes/generate",
      payload: {
        level: "n5",
        section: "kanji",
        count: 5,
        generationMode: "ai_generated",
        quizType: ["reading"],
      },
    });

    expect(response.statusCode).toBe(501);
    expect(response.json()).toEqual({
      status: "error",
      error: "AI quiz generation is not configured yet.",
    });
  });

  it("returns failed response shape for schema validation errors", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/quizzes/generate",
      payload: {
        level: "n5",
        section: "kanji",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      status: "failed",
    });
  });

  it("returns 400 for invalid level", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/api/v1/kanji?level=n2" });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      status: "failed",
      message: "Invalid or missing level. Expected n5, n4, or n3.",
    });
  });

  it("returns status and error for unhandled server errors", async () => {
    const app = await buildApp();
    app.get("/test/server-error", async () => {
      throw new Error("Unexpected failure");
    });

    const response = await app.inject({ method: "GET", url: "/test/server-error" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      status: "error",
      error: "Internal server error",
    });
  });
});
