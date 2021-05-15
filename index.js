const core = require("@actions/core");
const github = require("@actions/github");

if (require.main === module) {
  const getListReleases = (token) =>
    github.getOctokit(token).repos.listReleases;
  run({
    getInput: core.getInput,
    setOutput: core.setOutput,
    listReleases: getListReleases,
    context: github.context.repo,
  });
}

async function run({
  getInput,
  setOutput,
  listReleases,
  context,
}) {
  try {
    const token = getInput("token");

    console.info("Started retrieving releases");
    const request = listReleases(token);
    const { data } = await request(context);

    const { changelog, latest } = getChangelogAndLatest(data, {getInput});

    setOutput("changelog", changelog);
    setOutput("latest", latest);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getChangelogAndLatest(releases, {getInput}) {
  if (!Array.isArray(releases)) {
    throw new Error(
      `Expected an array back as response, but got "${typeof releases}"`
    );
  }

  const spacing = "\n\n";
  const latest = { tag: null, date: null };
  const changelog = releases
    .map(({ tag_name, draft, published_at, name, body }) => {
      if (draft) {
        console.info(`Skipping draft with the name "${name}"`);
        return null;
      }

      const date = new Date(published_at);
      if (latest.date == null || date > latest.date) {
        latest.date = date;
        latest.tag = tag_name;
      }

      const title = formatTitle(name, getInput);
      const description = formatDescription(body, getInput);

      return [title, description].filter(Boolean).join(spacing);
    })
    .filter(Boolean)
    .join(spacing);

  return { changelog, latest: latest.tag };
}

function formatTitle(replace, getInput) {
  return format(getInput("title-template"), "%%TITLE%%", replace);
}

function formatDescription(replace, getInput) {
  return format(getInput("description-template"), "%%DESCRIPTION%%", replace);
}

function format(template, find, replace) {
  return template.replace(find, replace || "");
}

module.exports = { run, getChangelogAndLatest };
