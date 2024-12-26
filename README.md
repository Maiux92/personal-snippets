# Personal Snippets
Simple dashboard to manage your code snippets and personal notes with syntax highlighting with a bring-your-own-authentication-provider philosophy.

## Features:
- Simple web interface to create, view, edit, and download your notes and code snippets
- Syntax highlighting via highligh.js
- Single-user environment without authentication
- Simple SQLite database

## Rationale
I needed a simple web interface to manage my notes and code snippets without requiring multiple users management, authentication, or collaboration capabilities, and I wanted to work even if my internet connection goes down (that's why all the libraries I use are in the assets/ directory). I tried multiple nopaste web apps, note editing web apps, and code collaboration web apps, but they didn't fit my needs.
I run a home server with [Traefik](https://traefik.io/traefik/) as a reverse proxy and [Authelia](https://www.authelia.com/) as a forward auth provider, and I don't need user management, authentication, or collaboration features. Therefore, I created ~~another one~~ my own web app.

## Dependencies
Personal Snippets uses the following libraries:
- [Bootstrap v5.3.3](https://getbootstrap.com/)
- [jQuery v3.7.1](https://jquery.com/)
- [Vue.js v2.7.16](https://vuejs.org/)
- Icons: [fontawesome v6.7.2](https://fontawesome.com/)
- Syntax Highlighting: [highlight.js v11.10.0](https://highlightjs.org/) with [highlightjs-line-numbers v2.9.0](https://github.com/wcoder/highlightjs-line-numbers.js) plugin

To ensure personal snippets work even in the absence of an active internet connection, it loads these libraries from the assets/ directory and not from a CDN.

## Disclaimer
I wrote the code in one night. I am not a front-end expert (that's why I didn't use node.js), which is probably inefficient/buggy and can be improved. I just needed something simple that works to manage my notes about my infrastructure and snippets of bash commands that I use once a year, and I didn't like the alternatives. 

---
# Usage
## Use your own HTTP server
You can simply copy the content of the src directory wherever you want, as long as the webserver supports SQLite and PHP.
I serve personal through an apache2 container, which I expose to my lan using [traefik](https://traefik.io/traefik/) reverse proxy, and I use [authelia](https://www.authelia.com/) to manage authentication.

## Docker
Simply run ``docker compose up -d``.
The compose file will create a local `db/` directory that will contain the SQLite database with your snippets.
You still need to add an authentication provider if you want to forbid access to your personal snippets instance.
