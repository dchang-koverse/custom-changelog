import { Octokit } from "octokit"

const octokit = new Octokit({
    // auth: process.env.TOKEN
});

const getCommitMessages = async () => {
    try {
        console.log('GETting commit messages')
        const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
            owner: "dchang-koverse",
            repo: "custom-changelog",
        });
    
        const messages = result.data.map(datum => datum.commit.message)
        console.log('commit messages', messages)
    
        return messages
    } catch (error) {
        console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
    }
}

const getTags = async () => {
    try {
        console.log('GETting tags')
        const result = await octokit.request("GET /repos/{owner}/{repo}/tags", {
            owner: "dchang-koverse",
            repo: "custom-changelog",
        });
    
        console.log('tags', result.data)
    } catch (error) {
        console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
    }
}

getCommitMessages()
getTags()
