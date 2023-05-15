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
            const filteredMessages = commitMessages
                .map(message => message.trim())
                .filter(commitMessage => commitMessage.startsWith(changeType));
            if (filteredMessages.length > 0) {
                // cleaning messages
                const cleanedMessages = filteredMessages
                    .map(filteredMessage => filteredMessage.substring(changeType.length))
                    
                changeLogMap.set(changeType, cleanedMessages);                
            }
        });

        console.log('changeLogMap:', changeLogMap)

        // Write to CHANGELOG.md
        console.log('Writing to CHANGELOG.md')

        console.log('Current directory', process.cwd())
        const files = fs.readdirSync('.');
        console.log('files', files)

        const file = 'CHANGELOG.md'
        access(file, constants.F_OK, (err) => {
            console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
        });

        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'CHANGELOG.md')
        const stream = fs.createWriteStream(filePath, {flags:'a'});
        stream.write(`\n\n## ${newestTag} (${new Date().toISOString().slice(0, 10)})\n`)
        changeLogMap.forEach((value, key) => {
            stream.write(`\n### ${key}\n`)
            value.forEach(message => {
                stream.write(`- ${message}\n`)
            })
        }
        )
        stream.end();

        // Add git commit
        console.log('Adding git commit')
        const { exec } = require("child_process");
        exec("git add . && git commit -m 'chore: update CHANGELOG.md'", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        })

    } catch (error) {
        console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
    }
}

createChangeLog()
