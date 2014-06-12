# Dropbox for Bookmarks
### A Chrome extension

My partner and I wanted to sync our bookmarks for recipe sharing. There aren't a lot of good options for that. So we decided it'd be fun to build it. And here we are.

**Note:** This is a work in progress and isn't meant for public use yet. The GitHub project does not include the server-side scripts yet, so don't download and install this expecting it to work. Once I have things a bit more organized, I'll include the server files. Eventually, the whole thing will be run as a service via a private server.

### What it's supposed to do

This extension is supposed to sync bookmarks in a specified folder to a server file by user key, simple and plain.

### What it actually does

As of version 0.2.0:

##### 1. Browser Action

* Adds a bookmark to a Chrome Bookmarks folder linked to the user's sync storage, then pushes the URL and Title of the new bookmark to user_key.json on a remote server.

##### 2. Background Events

* On Extension Install, generates a random 8-character user key to sync local Dropmarks to the server and creates the local Dropmarks folder in "Other Bookmarks".
* Syncs local bookmarks with those on the server on startup.
* Removes bookmarks from the server when they're removed locally.

##### 3. Options Page

* Displays your "unique" user key (note: user keys are not technically unique yet) which can be given to another user to sync a folder.
* Replace this user key with another user's key and click "Update Key" to sync another user's bookmarks to yours.

### Contributing

I'm not looking for a lot of direct coding support right now, however I could use a good name for the project!