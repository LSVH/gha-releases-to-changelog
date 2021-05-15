const { expect, test } = require("@jest/globals");
const { getChangelogAndLatest, run } = require(".");
const fixture = require("./raw-fixture.json");

const inputs = {
  "title-template": "# %%TITLE%%",
  "description-template": "%%DESCRIPTION%%",
};
const outputs = {};

const request = jest.fn().mockResolvedValue({ data: fixture });
const injections = {
  getInput: jest.fn((k) => inputs[k]),
  setOutput: jest.fn((k, v) => (outputs[k] = v)),
  listReleases: jest.fn(() => request),
};

describe("run()", () => {
  beforeEach(() => run(injections));

  test("base test, returns changelog", async () => {
    expect(request).toHaveBeenCalledTimes(1);
    expect(injections.listReleases).toHaveBeenCalledTimes(1);
    expect(injections.setOutput).toHaveBeenCalledTimes(2);
    expect(outputs).toHaveProperty("changelog");
    expect(outputs.changelog).not.toBeNull();
  });

  test("returns latest tag name", () => {
    expect(outputs).toHaveProperty("latest");
    expect(outputs.latest).toBe("0.1.5");
  });
});

describe("getChangelogAndLatest()", () => {
  const spacing = "\n\n";
  const releases = {
    v0: {
      draft: true,
      published_at: "2012-02-27T19:35:32Z",
      tag_name: "v0",
      name: "title v0",
      body: "description v0",
    },
    v1: {
      draft: false,
      published_at: "2013-02-27T19:35:32Z",
      tag_name: "v1",
      name: "title v1",
      body: "description v1",
    },
    v2: {
      draft: false,
      published_at: "2014-02-27T19:35:32Z",
      tag_name: "v2",
      name: "title v2",
      body: "description v2",
    },
  };
  test("with one valid entry", () => {
    const { changelog, latest } = getChangelogAndLatest(
      [releases.v1],
      injections
    );

    expect(latest).toBe(releases.v1.tag_name);

    const expected = [releases.v1.name, releases.v1.body].join(spacing);
    expect(changelog).toBe(expected);
  });

  test("with two valid entries", () => {
    const { changelog, latest } = getChangelogAndLatest(
      [releases.v1, releases.v2],
      injections
    );

    expect(latest).toBe(releases.v2.tag_name);

    const expected = [
      releases.v1.name,
      releases.v1.body,
      releases.v2.name,
      releases.v2.body,
    ].join(spacing);
    expect(changelog).toBe(expected);
  });

  test("with one valid draft and two valid entries", () => {
    const { changelog, latest } = getChangelogAndLatest(
      [releases.v0, releases.v1, releases.v2],
      injections
    );

    expect(latest).toBe(releases.v2.tag_name);

    const expected = [
      releases.v1.name,
      releases.v1.body,
      releases.v2.name,
      releases.v2.body,
    ].join(spacing);
    expect(changelog).toBe(expected);
  });

  describe("invalid entries:", () => {
    test("with an invalid date string for `published_at`", () => {
      const actual = { ...releases.v1, ...{ published_at: "foobar" } };

      const { changelog, latest } = getChangelogAndLatest([actual], injections);

      expect(latest).toBe(actual.tag_name);

      const expected = [actual.name, actual.body].join(spacing);
      expect(changelog).toBe(expected);
    });

    test("without `name` property", () => {
      const actual = { ...{}, ...releases.v1 };
      delete actual.name;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);

      expect(latest).toBe(actual.tag_name);

      const expected = [actual.body].join(spacing);
      expect(changelog).toBe(expected);
    });

    test("without `body` property", () => {
      const actual = { ...{}, ...releases.v1 };
      delete actual.body;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);

      expect(latest).toBe(actual.tag_name);

      const expected = [actual.name].join(spacing);
      expect(changelog).toBe(expected);
    });

    test("without `tag_name` property", () => {
      const actual = { ...{}, ...releases.v1 };
      delete actual.tag_name;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);

      expect(latest).toBe(actual.tag_name);

      const expected = [actual.name, actual.body].join(spacing);
      expect(changelog).toBe(expected);
    });

    test("without `published_at` property", () => {
      const actual = { ...{}, ...releases.v1 };
      delete actual.published_at;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);

      expect(latest).toBe(actual.tag_name);

      const expected = [actual.name, actual.body].join(spacing);
      expect(changelog).toBe(expected);
    });
  });
});
