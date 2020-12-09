import * as Jira from './jira.js';
import * as Confluence from './confluence.js';

const searchJql = "issuetype%20in%20%28Bug%2C%20Story%2C%20Task%2C%20%22Story%20bug%22%2C%20%22Story%20task%22%29%20AND%20status%20in%20%28Backlog%2C%20%22Design%20Review%22%2C%20%22Functional%20QA%22%2C%20%22In%20Progress%22%2C%20Open%2C%20%22Ready%20for%20QA%22%2C%20Reopened%2C%20%22To%20Do%22%29%20AND%20project%20not%20in%20%28%22Clorox%20Web%20Platform%22%29%20AND%20component%20not%20in%20%28Platform%29%20AND%20component%20not%20in%20%28%22Platform%20Update%22%29%20AND%20NOT%20%22Epic%20Link%22%20%3D%20Platform%20AND%20updated%20%3C%3D%20-30d%20ORDER%20BY%20lastViewed%20DESC"
const confluencePageUrl = "https://electro-creative-workshop.atlassian.net/wiki/spaces/TEC/pages/1101399131/Ticket+Age+Report";
const confluencePage = "1101399131";

async function runReport(){
    const confPageData = await Confluence.fetchPageData(confluencePage);
    const searchResult = await Jira.search(searchJql);
    const layout = await formatLayout(Jira.formatByAssignee(searchResult));
    await Confluence.write(layout,confluencePage,confPageData);

    console.log('Report updated!');
}

function formatLayout(result){
    let output = "";
    let overview = "";
   
    for (const assignee in result){
        overview += `<tr><td><a href="${confluencePageUrl}#${assignee.split(" ").join('')}">${assignee}</a></td><td>${result[assignee].length}</td></tr>`;
        output += `<h3 id="${assignee.split(" ").join('')}">${assignee}</h3><table><tbody><tr><th>ID</th><th>Ticket URL</th><th>Summary</th><th>Age</th></tr>`;
        let rows = "";
        
        result[assignee].map((issue) => {
            let seconds = Math.floor(issue.age / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);
            let months = Math.floor(days / 30);

            days %= 30;
            hours %= 24;
            minutes %= 60;
            seconds %= 60;

            const prettyAge = `${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`;
            const summary = issue.summary.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");
            
            rows += `<tr><td>${issue.id}</td><td><a href="https://electro-creative-workshop.atlassian.net/browse/${issue.id}">https://electro-creative-workshop.atlassian.net/browse/${issue.id}</a></td><td>${summary}</td><td>${prettyAge}</td></tr>`;
        });
        output += `${rows}</tbody></table>`;
    }

    output = `<h2>Outstanding counts</h2><table><tbody><tr><th>Assignee</th><th># outstanding</th></tr>${overview}</tbody></table>${output}`;

    return output;
}

runReport();