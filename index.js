import { Octokit } from "octokit"
import fs from 'fs';
import path from 'path';

const octokit = new Octokit({
    // auth: process.env.TOKEN
});

const CHANGELOG_FILE_PATH = './CHANGELOG.md'

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
        console.log('\nUpserting CHANGELOG')
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
            .map(commit => commit.commit.message)

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

        if (!fs.existsSync(CHANGELOG_FILE_PATH)) {
            // create it
        }
        console.log("CHANGELOG exists");
        const data = fs.readFileSync(CHANGELOG_FILE_PATH).toString().split("\n");

        data.splice(2, 0, '## ${newestTag}\n');

        changeLogMap.forEach((value, key) => {
            data.splice(3, 0, `### ${key}\n`);
            value.forEach(message => {
                data.splice(4, 0, `- ${message}`);
            })
        })

        var editedText = data.join("\n");

        console.log('editedText:', editedText);

        fs.writeFile(CHANGELOG_FILE_PATH, editedText, function (err) {
            if (err) return err;
        });

        console.log('Wrote to CHANGELOG')

        // Read CHANGELOG to verify changes
        console.log('Reading CHANGELOG.md')
        const fileContents = fs.readFileSync(CHANGELOG_FILE_PATH, 'utf8')
        console.log('fileContents:', fileContents)
    } catch (error) {
        console.log(`Error! Status: ${error}`)
    }
}

createChangeLog()
