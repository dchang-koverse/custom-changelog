import { Oktokit } from './oktokit.js';

const oktokit = new Oktokit({
    auth: ''
});

await octokit.request("GET /repos/{owner}/{repo}/issues", {
  owner: "octocat",
  repo: "Spoon-Knife",
});
