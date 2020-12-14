import fetch from 'node-fetch';

const jiraRestApi = "https://electro-creative-workshop.atlassian.net/rest/api/2/"
const jqlSearchCommand = "search?jql="

const aEmail = process.env.ATLASSIAN_EMAIL;
const aToken = process.env.ATLASSIAN_TOKEN;

const headers = {
    "Authorization": "Basic " + btoa(aEmail+":"+aToken),
    "Content-type": "application/json"
};

function btoa(str){
    return Buffer.from(str, 'utf-8').toString('base64')
}

async function search(jql){
    const url = jiraRestApi + jqlSearchCommand + jql + "&maxResults=-1";
    return fetch(url, {"headers": headers})
        .then(response => response.json())
}

function formatByBrand(json){
    const output = [];
    json.issues.map((issue) => {
        const created = new Date(issue.fields.created);
        const age = new Date() - created;

        output.push({
            "brand": issue.fields.project.key,
            "id": issue.key,
            "summary": issue.fields.summary,
            "age": age
        });
    });

    const presorted =  output.reduce((grouped,issue) => {
        const groupKey = issue['brand'];
        grouped[groupKey] = (grouped[groupKey] || []).concat(issue);
        return grouped;
    }, {});

    return Object.keys(presorted)
        .sort()
        .reduce((obj,key) => {
            obj[key] = presorted[key];  
            return obj; 
        },{});
}

function formatByAssignee(json){
    const output = [];
    json.issues.map((issue) => {
        const created = new Date(issue.fields.created);
        const age = new Date() - created;
        const assigneeId = issue.fields.assignee !== null ? issue.fields.assignee.accountId : "unassigned";
        const assigneeName = issue.fields.assignee !== null ? issue.fields.assignee.displayName : "unassigned";
        output.push({
            "assigneeId": assigneeId,
            "assigneeName": assigneeName,
            "brand": issue.fields.project.key,
            "id": issue.key,
            "summary": issue.fields.summary,
            "age": age
        });
    });

    const presorted =  output.reduce((grouped,issue) => {
        const groupKey = issue['assigneeName'];
        grouped[groupKey] = (grouped[groupKey] || []).concat(issue);
        return grouped;
    }, {});

    return Object.keys(presorted)
        .sort()
        .reduce((obj,key) => {
            obj[key] = presorted[key];  
            return obj; 
        },{});
}

export {
    search,
    formatByBrand,
    formatByAssignee
}