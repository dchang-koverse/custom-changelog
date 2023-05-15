import { Octokit } from "octokit"

const octokit = new Octokit({
    // auth: process.env.TOKEN
});

try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
        owner: "dchang-koverse",
        repo: "custom-changelog",
    });
    console.log('result', result.data)

    // const titleAndAuthor = result.data.map(issue => {
    //     title: issue.title,
    //     authorID: issue.user.id
    // })

    // console.log(titleAndAuthor)

} catch (error) {
    console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
}
