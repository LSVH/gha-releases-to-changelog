const core = require("@actions/core");
const { GitHub, context } = require("@actions/github");

if (require.main === module) {
  run();
}

async function run() {
  try {
    const github = new GitHub(process.env.GITHUB_TOKEN);
    const { owner, repo } = context.repo;

    const releases = await github.repos.listReleases({
      owner,
      repo,
    });

    const {changelog, latest} = getChangelogAndLatest(releases);

    core.setOutput("changelog", changelog);
    core.setOutput("latest", latest);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getChangelogAndLatest(releases, callback) {
  const getTemplate = callback ?? core.getInput;
  const latest = { tag: null, date: null };
  const changelog = releases.map(
    ({ tag_name, draft, published_at, name, body }) => {
      if (draft) {
        return null;
      }

      const date = new Date(published_at);
      if (latest.date == null || date > latest.date) {
        latest.date = date;
        latest.tag = tag_name;
      }

      const title = formatTitle(name, getTemplate);
      const description = formatDescription(body, getTemplate);

      return title + "\n\n" + description;
    }
  ).filter(Boolean).join("\n\n");

  return { changelog, latest: latest.tag };
}

function formatTitle(replace, getTemplate) {
  return format(getTemplate("title-template"), "%%TITLE%%", replace);
}

function formatDescription(replace, getTemplate) {
  return format(getTemplate("description-template"), "%%DESCRIPTION%%", replace);
}

function format(template, find, replace) {
  return template.replace(find, replace ?? '');
}


module.exports = {run, getChangelogAndLatest}