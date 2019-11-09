/*jslint browser, for */
/*globals console */

// Empty array, ready for repo data
var repoData = [];

// Generate the shell script text
function generateScript() {
    'use strict';

    // Where to put our output
    var outputContainer = document.getElementById("repos");

    // Clear the current, visible output
    outputContainer.innerHTML = '';

    // Add the once-only location variable.
    // (We don't want this repeating with every 'Generate'.)
    outputContainer.innerHTML += "location=$(pwd)\n";

    // Make the entity directory if it doesn't exist.
    var repoNumber;
    var currentRepoOwner = repoData[0].owner.login;
    outputContainer.innerHTML += "mkdir -p " + currentRepoOwner + "<br>";
    repoData.forEach(function (data, index) {

        // If we're adding a new repo owner's repos,
        // create a directory for them.
        if (currentRepoOwner !== data.owner.login) {
            currentRepoOwner = data.owner.login;
            outputContainer.innerHTML += "\n";
            outputContainer.innerHTML += "mkdir -p " + currentRepoOwner + "<br>";
        }

        repoNumber = index + 1;
        outputContainer.innerHTML += "\n";
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
function listRepos(data) {
    'use strict';
    data.forEach(function (dataEntry) {
        repoData.push(dataEntry);
    });
    generateScript();
}

// Return an API search URL based on user input
function searchURL(page) {
    'use strict';

    // Since this function may be used in a loop for each page of results,
    // also create a fallback in the event there is no page value
    if (page === 'undefined') {
        page = 1;
    }

    // Get the API token
    var token = document.getElementById('apitoken').value;

    // Check whether we're fetching org or user repos,
    // and construct a URL accordingly
    var url, entity;
    if (document.getElementById('select-organisation').checked && document.getElementById('input-organisation').value) {
        entity = document.getElementById('input-organisation').value;
        url = 'https://api.github.com/orgs/' + entity + '/repos?per_page=100&access_token=' + token + '&page=' + page;
    } else if (document.getElementById('select-user').checked && document.getElementById('input-user').value) {
        entity = document.getElementById('input-user').value;
        url = 'https://api.github.com/users/' + entity + '/repos?per_page=100&access_token=' + token + '&page=' + page;
    }

    // Return the URL
    return url;
}

// Iterate for each page of repos
function reposByPage(numberOfPages) {
    'use strict';

    // Call the getJSON function, and if there are no errors
    // then list the repos.
    var pageNumber = 1;
    var pagesReceived = 0;
    var dataReceived = [];
    for (pageNumber = 1; pageNumber <= numberOfPages; pageNumber += 1) {
        getJSON(searchURL(pageNumber), function (err, data) {
            if (err !== null) {
                console.log("Something went wrong: " + err);
            } else {
                pagesReceived += 1;
                data.forEach(function (entry) {
                    dataReceived.push(entry);
                });
                if (pagesReceived === numberOfPages) {
                    listRepos(dataReceived);
                }
            }
        });
    }
}

// Get the number of pages from the search request
function getNumberOfPages(url, callback) {
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

    getNumberOfPages(searchURL(), function (err, data) {
        if (err !== null) {
            console.log("Something went wrong getting the number of pages: " + err);
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
