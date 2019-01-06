/*jslint browser*/
/*globals*/

// Options

// Register with myrepos?
var myreposRegister = false;

// Put a list of repos in the console for reference
function listRepos(data) {
    'use strict';
    data.forEach(function (data) {
        console.log(data);
    });
}

// Generate the shell script text
function generateScript(data, outputContainer) {
    'use strict';
    // Make the entity directory if it doesn't exist.
    outputContainer.innerHTML += "mkdir -p " + data[0].owner.login + "<br>";
    data.forEach(function (data) {
        outputContainer.innerHTML += "cd " + data.owner.login;
        outputContainer.innerHTML += " && git clone git@github.com:" + data.full_name + ".git";
        outputContainer.innerHTML += " || echo 'A " + data.name + " folder exists.";
        if (myreposRegister) {
            outputContainer.innerHTML += " We will not clone it, but will register the existing folder.'";
            outputContainer.innerHTML += " && cd " + data.name;
            outputContainer.innerHTML += " && mr register";
            outputContainer.innerHTML += " && cd ../";
        }
        outputContainer.innerHTML += " && cd ../";
        outputContainer.innerHTML += "<br>";
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

// The main function
function generate() {
    'use strict';

    // Where to put our output
    var outputContainer = document.getElementById("repos");

    // Get the API token
    var token = document.getElementById("apitoken").value;

    // Check whether we're fetching org or user repos,
    // and construct a URL accordingly
    var url, entity;
    if (document.getElementById("select-organisation").checked && document.getElementById("input-organisation").value) {
        entity = document.getElementById("input-organisation").value;
        url = "https://api.github.com/orgs/" + entity + "/repos?per_page=100&access_token=" + token;
    } else if (document.getElementById("select-user").checked && document.getElementById("input-user").value) {
        entity = document.getElementById("input-user").value;
        url = "https://api.github.com/users/" + entity + "/repos?per_page=100&access_token=" + token;
    }

    // Call the getJSON function, and if there are no errors
    // then call the functions that list the repos.
    getJSON(url, function (err, data) {
        if (err !== null) {
            console.log("Something went wrong: " + err);
        } else {
            listRepos(data);
            generateScript(data, outputContainer);
        }
    });
}

// Clear the output
function clearOutput() {
    'use strict';
    var outputWrapper = document.getElementById("output-wrapper");
    outputWrapper.innerHTML = "<pre id='repos'></pre>";
}

// Listen for 'Enter' in the form
var fields = document.querySelectorAll("#input-organisation, #input-user");
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
