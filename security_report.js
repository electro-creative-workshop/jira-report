import * as Jira from './jira.js';
import * as Confluence from './confluence.js';

const searchJql = "status%20in%20%28%22In%20Progress%22%2C%20Open%29%20AND%20labels%20%3D%20Security%20order%20by%20created%20DESC";
const confluencePageUrl = "https://electro-creative-workshop.atlassian.net/wiki/spaces/TEC/pages/1154449668/Security+report";
const confluencePage = "1154449668";

async function runReport(){
    const confPageData = await Confluence.fetchPageData(confluencePage);
    const searchResult = await Jira.search(searchJql);
    const layout = await formatLayout(Jira.formatByBrand(searchResult));
    await Confluence.write(layout,confluencePage,confPageData);

    console.log('Report updated!');
}

async function formatLayout(result){
    let output = "";
    let overview = "";
    let total = 0;
   
    for (const brand in result){
        overview += `<tr><td><a href="${confluencePageUrl}#${brand}">${brand}</a></td><td>${result[brand].length}</td></tr>`;
        output += `<h3 id="${brand}">${brand}</h3><table><tbody><tr><th>ID</th><th>Ticket URL</th><th>Summary</th><th>Age</th></tr>`;
        let rows = "";
        result[brand].map((issue) => {
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
        total += result[brand].length;
    }

    output = `<h2>Outstanding counts</h2><p>total: ${total}</p><table><tbody><tr><th>Brand</th><th># outstanding</th></tr>${overview}</tbody></table>${output}`;

    return output;
}

runReport();