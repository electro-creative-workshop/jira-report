import fetch from 'node-fetch';

const confluenceRestApi = "https://electro-creative-workshop.atlassian.net/wiki/rest/api/"
const aEmail = process.env.ATLASSIAN_EMAIL;
const aToken = process.env.ATLASSIAN_TOKEN;

const headers = {
    "Authorization": "Basic " + btoa(aEmail+":"+aToken),
    "Content-type": "application/json"
};

function btoa(str){
    return Buffer.from(str, 'utf-8').toString('base64')
}

async function fetchPageData(page){
    const url = confluenceRestApi + "content/" + page + "?expand=version.number";
    return fetch(url, {"headers": headers})
        .then(response => response.json())
        .then(json => {
            return {
                "id": json.id,
                "type": json.type,
                "title": json.title,
                "version": json.version.number * 1
            }
        })
}

async function write(layout, page ,confPageData){
    const url = confluenceRestApi + "content/" + page;
    const payload = {
        "version": {
            "number": confPageData.version + 1
        },
        "title": confPageData.title,
        "type": confPageData.type,
        "body": {
            "storage": {
                "value": layout,
                "representation": "storage"
            }
        }
    };

    return fetch(url, {
        "headers": headers,
        "method": "PUT",
        "body": JSON.stringify(payload)
    }).then(response => { console.log('response:',response) });
}

export {
    fetchPageData,
    write
}