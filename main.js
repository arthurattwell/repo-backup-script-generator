/*jslint browser, for */
/*globals console */

// Empty array, ready for repo data
var repoData = [];

// Generate the shell script text
function generateScript() {
    'use strict';

    // Where to put our output
    var outputContainer = document.getElementById("repos");

    // Add the once-only location variable.
    // (We don't want this repeating with every 'Generate'.)
    outputContainer.innerHTML += "location=$(pwd)\n";

    // Make the entity directory if it doesn't exist.
    var repoNumber;
    outputContainer.innerHTML += "mkdir -p " + repoData[0].owner.login + "<br>";
    repoData.forEach(function (data, index) {
        repoNumber = index + 1;
        outputContainer.innerHTML += "# " + repoNumber + "\n";
        outputContainer.innerHTML += "cd " + data.owner.login + "\n";
        outputContainer.innerHTML += "git clone git@github.com:" + data.full_name + ".git";
        outputContainer.innerHTML += " || echo 'The " + data.name + " folder exists. Updating.'\n";
        outputContainer.innerHTML += "if [ -d " + data.name + " ]; then\n";
        outputContainer.innerHTML += "    cd " + data.name + "\n";
        outputContainer.innerHTML += "    git pull\n";
        outputContainer.innerHTML += "fi\n";
        outputContainer.innerHTML += "cd $location\n";
    });
}

// Get the JSON data over https
function getJSON(url, callback) {
    'use strict';
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
}

// Populate the array of repo data, and
// put a list of repos in the console for reference
function listRepos(data, status) {
    'use strict';
    console.log(status);
    data.forEach(function (dataEntry) {
        repoData.push(dataEntry);
    });
    console.log(repoData);
    generateScript();
    // to do: prevent duplicates from multiple pages
}

function searchURL(page) {
    'use strict';

    // Create a fallback for a missing page value
    if (page === 'undefined') {
        page = 1;
    }

    // Get the API token
    var token = document.getElementById("apitoken").value;

    // Check whether we're fetching org or user repos,
    // and construct a URL accordingly
    var url, entity;
    if (document.getElementById("select-organisation").checked && document.getElementById("input-organisation").value) {
        entity = document.getElementById("input-organisation").value;
        url = "https://api.github.com/orgs/" + entity + "/repos?per_page=100&access_token=" + token + '&page=' + page;
    } else if (document.getElementById("select-user").checked && document.getElementById("input-user").value) {
        entity = document.getElementById("input-user").value;
        url = "https://api.github.com/users/" + entity + "/repos?per_page=100&access_token=" + token + '&page=' + page;
    }
    return url;
}

// Iterate for each page of repos
function reposByPage(numberOfPages) {
    'use strict';
    // Call the getJSON function, and if there are no errors
    // then list the repos.
    var pageNumber;
    for (pageNumber = 1; pageNumber <= numberOfPages; pageNumber += 1) {
        getJSON(searchURL(pageNumber), function (err, data) {
            if (err !== null) {
                console.log("Something went wrong: " + err);
            } else {
                listRepos(data);
            }
        });
    }
}

// Get the number of pages from the search request
function getPages(url, callback) {
    'use strict';
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            var pages, pagesString, linkHeader;
            if (xhr.getResponseHeader('Link')) {
                linkHeader = xhr.getResponseHeader('Link');
                pagesString = linkHeader.match(/&page=(\d+).*$/)[1];
                pages = parseInt(pagesString);
            } else {
                pages = 1;
            }
            callback(null, pages);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
}

// The main function
function generate() {
    'use strict';

    getPages(searchURL(), function (err, data) {
        if (err !== null) {
            console.log("Something went wrong: " + err);
        } else {
            reposByPage(data);
        }
    });
}

// Clear the output
function clearOutput() {
    'use strict';
    var outputWrapper = document.getElementById("output-wrapper");
    outputWrapper.innerHTML = "<pre id='repos'></pre>";

    // Empty the array of repo data, too
    repoData = [];
}

// Listen for 'Enter' in the form
var fields = document.querySelectorAll("#input-organisation, #input-user, #apitoken");
fields.forEach(function (field) {
    'use strict';
    field.addEventListener("keyup", function (event) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Trigger the button element with a click
            document.getElementById("generate").click();
        }
    });
});

// Listen for 'Clear output' in the form
var clearOutputButton = document.querySelector("#clearOutput");
clearOutputButton.addEventListener("click", function () {
    'use strict';
    clearOutput();
});

// Listen for 'Generate output' in the form
var generateButton = document.querySelector("#generate");
generateButton.addEventListener("click", function () {
    'use strict';
    generate();
});
