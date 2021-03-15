
const https = require('https');
const fs = require('fs');
require('dotenv-defaults').config()

const BASE_URL = process.env.BASE_URL;
const OUTPUT_FILE = process.env.INPUT_DIR + "/" + process.env.DATA_FILE;

function getUrl(base_url) {

    var now = new Date();
    var dd = String(now.getDate()).padStart(2, '0');
    var mm = String(now.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = now.getFullYear();

    today = yyyy + mm + dd;
    //var today = "20201216" //valid extension
    url = base_url + today + ".csv"

    return url
}

async function downloadFile(url, path) {
    return new Promise((resolve, reject) => {
        https.get(url, {timeout: 100}, function(response) {
            if (response.statusCode === 200) {
                response.pipe(fs.createWriteStream(path));
                resolve(response.statusCode);
            } else if (response.statusCode === 404) {
                resolve(response.statusCode);
            } else {
                throw new Error(response.statusCode);
            }
        }).on('error', error => {
            console.error(error);
            reject(error);
        });
    });
}

async function main() {
    try {
        let statusCode = await downloadFile(getUrl(BASE_URL), OUTPUT_FILE);
        console.log(statusCode);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

main();
