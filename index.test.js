const { expect, test } = require("@jest/globals");
const { getChangelogAndLatest } = require(".");

const v0 = {
  draft: true,
  published_at: "2012-02-27T19:35:32Z",
  tag_name: "v0",
  name: "title v0",
  body: "description v0",
};
const v1 = {
  draft: false,
  published_at: "2013-02-27T19:35:32Z",
  tag_name: "v1",
  name: "title v1",
  body: "description v1",
};
const v2 = {
  draft: false,
  published_at: "2014-02-27T19:35:32Z",
  tag_name: "v2",
  name: "title v2",
  body: "description v2",
};

const templates = {
  "title-template": "%%TITLE%%",
  "description-template": "%%DESCRIPTION%%",
};
const injections = {
  getInput: jest.fn((tag) => templates[tag]),
};

describe("getChangelogAndLatest()", () => {
  test("with one valid entry", () => {
    const { changelog, latest } = getChangelogAndLatest([v1], injections);

    expect(latest).toBe(v1.tag_name);

    const expected = [v1.name, v1.body].join("\n\n");
    expect(changelog).toBe(expected);
  });

  test("with two valid entries", () => {
    const { changelog, latest } = getChangelogAndLatest([v1, v2], injections);

    expect(latest).toBe(v2.tag_name);

    const expected = [v1.name, v1.body, v2.name, v2.body].join("\n\n");
    expect(changelog).toBe(expected);
  });

  test("with one valid draft and two valid entries", () => {
    const { changelog, latest } = getChangelogAndLatest([v0, v1, v2], injections);

    expect(latest).toBe(v2.tag_name);

    const expected = [v1.name, v1.body, v2.name, v2.body].join("\n\n");
    expect(changelog).toBe(expected);
  });

  describe("invalid entries:", () => {
    test("with an invalid date string for `published_at`", () => {
      const actual = {...v1, ...{published_at: 'foobar'}};

      const { changelog, latest } = getChangelogAndLatest([actual], injections);
  
      expect(latest).toBe(actual.tag_name);
  
      const expected = [actual.name, actual.body].join("\n\n");
      expect(changelog).toBe(expected);
    });

    test("without `name` property", () => {
      const actual = {...{}, ...v1};
      delete actual.name;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);
  
      expect(latest).toBe(actual.tag_name);
  
      const expected = [actual.name, actual.body].join("\n\n");
      expect(changelog).toBe(expected);
    });

    test("without `body` property", () => {
      const actual = {...{}, ...v1};
      delete actual.body;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);
  
      expect(latest).toBe(actual.tag_name);
  
      const expected = [actual.name, actual.body].join("\n\n");
      expect(changelog).toBe(expected);
    });

    test("without `tag_name` property", () => {
      const actual = {...{}, ...v1};
      delete actual.tag_name;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);
  
      expect(latest).toBe(actual.tag_name);
  
      const expected = [actual.name, actual.body].join("\n\n");
      expect(changelog).toBe(expected);
    });

    test("without `published_at` property", () => {
      const actual = {...{}, ...v1};
      delete actual.published_at;

      const { changelog, latest } = getChangelogAndLatest([actual], injections);
  
      expect(latest).toBe(actual.tag_name);
  
      const expected = [actual.name, actual.body].join("\n\n");
      expect(changelog).toBe(expected);
    });
  });
});
