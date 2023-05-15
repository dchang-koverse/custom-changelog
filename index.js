import { Octokit } from "octokit"

const octokit = new Octokit({
    // auth: process.env.TOKEN
});

const getCommitMessages = async () => {
    try {
        console.log('\nGETting commit messages')
        const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
            owner: "dchang-koverse",
            repo: "custom-changelog",
        });
    
        const messages = result.data.map(datum => datum.commit.message)
        console.log('commit messages: {messages}\n', { messages })
    
        return messages
    } catch (error) {
        console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
    }
}

const getTags = async () => {
    try {
        console.log('\nGETting tags')
        const result = await octokit.request("GET /repos/{owner}/{repo}/tags", {
            owner: "dchang-koverse",
            repo: "custom-changelog",
        });
    
        const tags = result.data.map(datum => {
            return {
                tagName: datum.name,
                commit: datum.commit.sha,
            }
        })
        console.log('tags: {tags}\n', { tags })
        return tags
    } catch (error) {
        console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
    }
}

const createChangeLog = async () => {
    try {
        console.log('\nCreating CHANGELOG')
        const result = await octokit.request("GET /repos/{owner}/{repo}/tags", {
            owner: "dchang-koverse",
            repo: "custom-changelog",
        });
    
        const tags = result.data.map(datum => {
            return {
                tagName: datum.name,
                commit: datum.commit.sha,
            }
        })

        const latestTag = tags[1].tagName
        const newestTag = tags[0].tagName

        // get diff between tags
        const comparedResults = await octokit.request("GET /repos/{owner}/{repo}/compare/{latestTag}...{newestTag}", {
            owner: "dchang-koverse",
            repo: "custom-changelog",
            latestTag,
            newestTag,
        });

        const numCommits = comparedResults.data.commits.length

        if (numCommits <= 0) {
            console.error('No commits found between tags')
        }
        
        const commitMessages = comparedResults.data.commits
        console.log('commitMessages: {commitMessages}\n', { commitMessages })

    } catch (error) {
        console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
    }
}

// getCommitMessages()
// getTags()
createChangeLog()
