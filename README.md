# Clone-all-repos script generator

Generates a script for backing up all your GitHub repos. Clunky, but it works. tested only with Ubuntu. YMMV on Mac and Windows.

Use it at [arthurattwell.github.io/myrepos-setup](http://arthurattwell.github.io/myrepos-setup), where there are more instructions.

## Run locally

Run `ruby -run -e httpd . -p 5000` to serve the page at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).

## Use with myrepos

Experimental. To add a comment to register each repo with [myrepos](http://myrepos.branchable.com/), set `myreposRegister` to `true` in `main.js`.
