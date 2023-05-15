import { Octokit } from "octokit"

const octokit = new Octokit({
    // auth: process.env.TOKEN
});

const CHANGE_TYPES = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'chore',
    'revert',
    'ci',
    'build',
    'other',
]

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
        
        const commits = comparedResults.data.commits
        // console.log('commits:', commits)

        const commitObjects = commits.map(commit => {
            return commit.commit
        })
        // console.log('commitObjects:', commitObjects)

        const commitMessages = commitObjects.map(commitObject => {
            return commitObject.message
        })
        console.log('commitMessages:', commitMessages)

        // Map values for CHANGELOG
        // Map<String, String[]>
        const changeLogMap = new Map();

        CHANGE_TYPES.forEach(changeType => {
            const filteredMessages = commitMessages.filter(commitMessage => commitMessage.startsWith(changeType));
            if (filteredMessages.length > 0) {
                // trim off changeType
                const trimmedMessages = filteredMessages.map(filteredMessage => filteredMessage.substring(changeType.length + 1))
                changeLogMap.set(changeType, trimmedMessages);                
            }
        });

        console.log('changeLogMap:', changeLogMap)

    } catch (error) {
        console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
    }
}

// getCommitMessages()
// getTags()
createChangeLog()
