import * as Jira from './jira.js';
import * as Confluence from './confluence.js';

const searchJql = 'issuetype%20in%20%28Task%2C%20%22Story%20task%22%29%20AND%20status%20%3D%20Open%20AND%20component%20%3D%20EMPTY';
const confluencePageUrl = "https://electro-creative-workshop.atlassian.net/wiki/spaces/TEC/pages/1125613827/Missing+components+report";
const confluencePage = "1125613827";

async function runReport(){
    const confPageData = await Confluence.fetchPageData(confluencePage);
    const searchResult = await Jira.search(searchJql);
    const layout = await formatLayout(searchResult);
    await Confluence.write(layout,confluencePage,confPageData);

    console.log('Report updated!');
}

function formatLayout(rawResult){
    let output = "";
    let overview = "";
    
    // filter out the TSD
    const TSD_removed = rawResult.issues.filter(issue => issue.fields.project.key !== 'TSD');
    rawResult.issues = TSD_removed;

    const result = Jira.formatByReporter(rawResult)

    for (const reporter in result){
        overview += `<tr><td><a href="${confluencePageUrl}#${reporter.split(" ").join("-")}">${reporter}</a></td><td>${result[reporter].length}</td></tr>`;
        output += `<h3 id="${reporter.split(" ").join('-')}">${reporter}</h3><table><tbody><tr><th>ID</th><th>Ticket URL</th><th>Summary</th></tr>`;
        let rows = "";
        
        result[reporter].map((issue) => {
            if (issue.brand !== 'TSD'){
                const summary = issue.summary.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");
                rows += `<tr><td>${issue.id}</td><td><a href="https://electro-creative-workshop.atlassian.net/browse/${issue.id}">https://electro-creative-workshop.atlassian.net/browse/${issue.id}</a></td><td>${summary}</td></tr>`;
            }
        });
        output += `${rows}</tbody></table>`;
    }

    output = `<h2>Outstanding counts</h2><table><tbody><tr><th>Reporter</th><th># outstanding</th></tr>${overview}</tbody></table>${output}`;

    return output;
}

runReport();