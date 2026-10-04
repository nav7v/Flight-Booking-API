import request from "supertest";
import assert from "assert";

const base = "http://localhost:3000";

describe("API smoke tests", function () {
  it("GET /api/flights should return 200", async function () {
    const res = await request(base).get("/api/flights");
    assert.equal(res.status, 200);
  });
});
