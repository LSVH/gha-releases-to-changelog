const core = require("@actions/core");
const github = require("@actions/github");

if (require.main === module) {
  run();
}

async function run(inject = {}) {
  try {
    const getInput = inject.getInput || core.getInput;
    const setOutput = inject.setOutput || core.setOutput;
    const getClient = inject.getClient || github.getOctokit;
    const context = inject.context || github.context.repo;

    const token = getInput("token");
    const client = getClient(token);

    const releases = await client.repos.listReleases(context);

    const { changelog, latest } = getChangelogAndLatest(releases, inject);

    setOutput("changelog", changelog);
    setOutput("latest", latest);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getChangelogAndLatest(releases, inject) {
  const getInput = inject.getInput || core.getInput;

  const latest = { tag: null, date: null };
  const changelog = releases
    .map(({ tag_name, draft, published_at, name, body }) => {
      if (draft) {
        return null;
      }

      const date = new Date(published_at);
      if (latest.date == null || date > latest.date) {
        latest.date = date;
        latest.tag = tag_name;
      }

      const title = formatTitle(name, getInput);
      const description = formatDescription(body, getInput);

      return title + "\n\n" + description;
    })
    .filter(Boolean)
    .join("\n\n");

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
