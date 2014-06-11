# Dropbox for Bookmarks
### A Chrome extension

My partner and I wanted to sync our bookmarks for recipe sharing. There aren't a lot of good options for that. So we decided it'd be fun to build it. And here we are.

**Note:** This is a fun, learning project for me right now. Right now it's a work in progress, so bear with me as I work on this project in my spare time. Eventually I want it to be a publicly useable Chrome extension, but right now it's only good for me and my partner.

### What it's supposed to do

This extension is supposed to sync bookmarks in a specified folder to a server file by user key, simple and plain.

### What it actually does

As of the latest big commit, the extension does a few things:

##### 1. Browser Action

* Adds a bookmark to a Chrome Bookmarks folder called "Dropmarks", then pushes the URL and Title of the new bookmark to user_key.json on a remote server.

##### 2. Options page

* On first load, generates a random 8-character key to identify a particular user, machine, or whatever.
* Options also allows users to change the key associated with their browser (currently only one user_key is allowed at a time).
* Finally, users can pull missing "Dropmarks" from the server to local by clicking "Sync with server"

##### 3. Background script

* Currently, the background script creates/sets the synced folder and that's it.
* In future versions, it will handle syncing the folder in both directions.

### Contributing

I'm not looking for a lot of direct coding support right now, however I could use a good name for the project!