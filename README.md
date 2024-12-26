# <img src="https://github.com/Maiux92/personal-snippets/raw/refs/heads/main/src/assets/favicon.png" border="0" width="32px"> Personal Snippets
Simple dashboard to manage your code snippets and personal notes with syntax highlighting and a bring-your-own-authentication-provider philosophy.

![](https://github.com/Maiux92/personal-snippets/raw/refs/heads/main/misc/screen.gif)

## Features:
- Simple web interface to create, view, edit, and download your notes and code snippets
- Syntax highlighting via highligh.js
- Search text across all snippets (title and content)
- Single-user environment without authentication
- Simple SQLite database
- [Homepage](https://github.com/gethomepage/homepage) widget/stats

## Rationale
I needed a simple web interface to manage my notes and code snippets without requiring multiple users management, authentication, or collaboration capabilities, and I wanted it to work even if my internet connection goes down (that's why all the used libraries are in the `assets/` directory). I tried multiple nopaste web apps, note editing web apps, and code collaboration web apps, but they didn't fit my needs.
I run a home server with [Traefik](https://traefik.io/traefik/) as a reverse proxy and [Authelia](https://www.authelia.com/) as a forward auth provider, and I don't need user management, authentication, or collaboration features. Therefore, I created ~~another snippet management web app~~ my own web app.

## Dependencies
Personal Snippets uses the following libraries:
- [Bootstrap v5.3.3](https://getbootstrap.com/)
- [jQuery v3.7.1](https://jquery.com/)
- [Vue.js v2.7.16](https://vuejs.org/)
- Icons: [fontawesome v6.7.2](https://fontawesome.com/)
- Syntax Highlighting: [highlight.js v11.10.0](https://highlightjs.org/) with [highlightjs-line-numbers v2.9.0](https://github.com/wcoder/highlightjs-line-numbers.js) plugin
- Favicon from [Flaticon](https://www.flaticon.con): [Code icons created by Roundicons Premium - Flaticon](https://www.flaticon.com/free-icons/code)

To ensure Personal Snippets works even in the absence of an active internet connection, it loads these libraries from the `assets/` directory and not from a CDN.

## Disclaimer
I wrote the code in one night~ish. I am not a front-end expert, and the code is probably inefficient/buggy and can be improved. I just needed something simple to manage my notes about my infrastructure and snippets of bash commands that I use once a year, and I didn't like the alternatives. 

---
# Usage
## Use your own HTTP server and authentication provider
You can simply copy the content of the src directory wherever you want, as long as the webserver supports SQLite and PHP.
In my production~ish environment, I serve Personal Snippets through an apache2 webserver in a docker container, which I expose to my LAN using [traefik](https://traefik.io/traefik/) reverse proxy, and I use [authelia](https://www.authelia.com/) for authentication.

## Try it with docker
Simply run ``docker compose up -d``.
The compose file will create a local `db/` directory that will contain the SQLite database with your snippets.
You still need to add an authentication provider if you want to forbid access to your Personal Snippets instance.

## Homepage widget
![](https://github.com/Maiux92/personal-snippets/raw/refs/heads/main/misc/homepage-screen.png)

1) Follow [homepage guide](https://gethomepage.dev/configs/services/#icons) to enable custom icons, which simply requires you to create a docker mount to `/app/public/icons` (e.g. `- ./icons:/app/public/icons`)
2) Copy `src/assets/favicon.png` from personal snippets git repo to homepage's `icons/` docker mount (name it `personal-snippets.png`)
3) Include the following in your configuration

```
- PersonalSnippets:
      href: {YOUR_PERSONAL_SNIPPETS_INSTANCE_URL}
      icon: /icons/personal-snippets.png
      widget:
        type: customapi
        url: {YOUR_PERSONAL_SNIPPETS_INSTANCE_URL}/api.php?stats
        mappings:
          - field: snippets
            label: Snippets Count
          - field: languages
            label: Different Languages
```
