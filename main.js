// Listen for 'Enter' in the form
var fields = document.querySelectorAll("#input-organisation, #input-user");
fields.forEach(function(field) {
    field.addEventListener("keyup", function(event) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Trigger the button element with a click
            document.getElementById("generate").click();
        }
    });
})

// Put a list of repos in the console for reference
function listRepos(data) {
    data.forEach(function(data) {
        console.log(data);
    });
}

// Generate the shell script text
function generateScript(data, entity, outputContainer) {
    // Make the entity directory if it doesn't exist.
    outputContainer.innerHTML += "mkdir -p " + data[0].owner.login + "<br>";
    data.forEach(function(data) {
        outputContainer.innerHTML += "cd " + data.owner.login;
        outputContainer.innerHTML += " && git clone git@github.com:" + data.full_name + ".git";
        outputContainer.innerHTML += " || echo 'Folder exists, not cloning " + data.name + "'";
        outputContainer.innerHTML += " && cd " + data.name;
        outputContainer.innerHTML += " && mr register";
        outputContainer.innerHTML += " && cd ../../";
        outputContainer.innerHTML += "<br>";
    });
}

// Get the JSON data over https
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

// The main function
function generate() {

    // Where to put our output
    var outputContainer = document.getElementById("repos");

    // Get the API token
    var token = document.getElementById("apitoken").value;

    // Check whether we're fetching org or user repos,
    // and construct a URL accordingly
    if (document.getElementById("select-organisation").checked && document.getElementById("input-organisation").value) {
            var entity = document.getElementById("input-organisation").value;
            var url = "https://api.github.com/orgs/" + entity + "/repos?per_page=100&access_token=" + token;
    } else if (document.getElementById("select-user").checked && document.getElementById("input-user").value) {
            var entity = document.getElementById("input-user").value;
            var url = "https://api.github.com/users/" + entity + "/repos?per_page=100&access_token=" + token;
    }

    // Call the getJSON function, and if there are no errors
    // then call the functions that list the repos.
    getJSON(url, function(err, data) {
        if (err !== null) {
            console.log("Something went wrong: " + err);
        } else {
            listRepos(data);
            generateScript(data, entity, outputContainer);
        }
    });
}

// Clear the output
function clearOutput() {
    var outputWrapper = document.getElementById("output-wrapper");
    outputWrapper.innerHTML = "<pre id='repos'></pre>";
}
