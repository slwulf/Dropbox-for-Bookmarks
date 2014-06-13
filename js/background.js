// Compare arrays | Usage: isEqArrays(arr1, arr2);
function inArray(array, el) {
    for ( var i = array.length; i--; ) {
        if ( array[i] === el ) return true;
    }
    return false;
}

function isEqArrays(arr1, arr2) {
    $missing = [];
    if (arr1.length !== arr2.length) {
        for ( var i = 0; i < arr1.length; i++ ) {
            if ( !inArray( arr2, arr1[i] ) ) {
                $missing.push(arr1[i]);
            }
        }
        return $missing;
    }
    return true;
}
/* --- */


// Generate a randomized alphanum string by length
function keyGen(len) {
    var text = '';
    var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for ( var z=0; z < len; z++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text;
}
/* --- */


// Function for syncing bookmarks
function syncMarks(savedKey) {
    chrome.storage.sync.get('folder_id',function(data){
        $folder = data.folder_id;
    });

    var $remMarks = [],
        $locUrls = [],
        $locMarks = [],
        $synced;

    // Get remote data
    $.getJSON('http://localhost:8888/dropmarks/'+savedKey+'.json', function(rem){
        for (var i in rem) {
            $remMarks.push([rem[i].url, rem[i].title]);
        }

        // Get local data
        chrome.bookmarks.getChildren($folder, function(loc){
            for (var x = 0; x < loc.length; x++) {
                $locMarks.push([loc[x].url, loc[x].title]);
                $locUrls.push(loc[x].url);
            }

            // Check remote data against local data
            var $match_data = isEqArrays($remMarks, $locMarks);

            if ( $match_data === true ) {
                console.log('synced');
            } else {
                // If any from remote are missing, add locally.
                for ( var y = $match_data.length; y--; ) {
                    if ( !inArray($locUrls, $match_data[y][0]) ) {
                        chrome.bookmarks.create({
                            'parentId': $folder,
                            'title': $match_data[y][1],
                            'url': $match_data[y][0]
                        });
                    }
                }
            }
        });
    });
}
/* --- */


// Function to check for and create Dropmarks folder
function getFolder() {
    var $folder, $dm_id;

    // First, check if a folder ID is in storage.
    chrome.storage.sync.get('folder_id', function(data){
         $dm_id = data.folder_id;
    });

    console.log($dm_id);

    if ( $dm_id === '' || ! $dm_id ) {
    // If the stored folder ID is blank or doesn't exist,
    // create a new folder and store/output its ID.
        chrome.bookmarks.create({
            'title': 'Dropmarks'
        }, function(newFolder){
            $folder = newFolder.id;
            chrome.storage.sync.set({
                'folder_id': newFolder.id
            });
        });

    } else {
    // If a stored folder ID is found, make sure it's
    // a folder and not a bookmark for some reason.
        chrome.bookmarks.getSubTree($dm_id, function(results){
            id = results[0].id;
            url = results[0].url;

            if ( id == $dm_id && ! url ) {
            // If it is a folder, output its ID.
                $folder = $dm_id;
            } else {
            // If not, create a new folder and
            // store/output its ID.
                chrome.bookmarks.create({
                    'title': 'Dropmarks'
                }, function(newFolder){
                    $folder = newFolder.id;
                    chrome.storage.sync.set({
                        'folder_id': newFolder.id
                    });
                });
            }
        });
    }

    return $folder;
}
/* --- */


// function to refresh the local cache of bookmarks periodically
function refreshCache() {
    chrome.alarms.create('localCache', {
        delayInMinutes: 5,
        periodInMinutes: 5,
    });
}
/* --- */


// Function to backup local marks to cache removed URLs
function cacheMarks() {
    // First, clear the cache.
    chrome.storage.local.remove('cacheMarks');
    chrome.alarms.clearAll();

    chrome.storage.sync.get('folder_id',function(folder){
        var $id = folder.folder_id;
        chrome.bookmarks.getChildren($id, function(results){
            var $cache = [];
            for (var i = 0; i < results.length; i++) {
                $cache.push([results[i].id, results[i].url]);
            }
            chrome.storage.local.set({
                'cacheMarks': $cache
            });
            refreshCache();
        });
    });
}
/* --- */


// chrome api hook to refresh cache
chrome.alarms.onAlarm.addListener(function(alarm){
    if (alarm.name == 'localCache') {
        cacheMarks();
        console.log('Cache refreshed.');
        chrome.storage.sync.get('userKey',function(key){
            syncMarks(key.userKey);
            console.log('Bookmarks synced.');
        });
    }
});
/* --- */


// extension init
chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason == 'install') {
        $dropmarks = getFolder();
        chrome.storage.sync.set({
            'userKey': keyGen(8),
            'folder_id': $dropmarks
        });
        alert('Welcome to Dropmarks!');
    } else {
        var thisVersion = chrome.runtime.getManifest().version;
        alert('Updated from '+ details.previousVersion +' to '+ thisVersion +'!');
    }

    chrome.storage.sync.get('userKey',function(data){
        $user_id = data.userKey;
    });
});
/* --- */


// check for new bookmarks on startup
chrome.runtime.onStartup.addListener(function(){
    chrome.storage.sync.get('userKey',function(data){
        syncMarks(data.userKey);
    });

    cacheMarks();
});
/* --- */

/* log the local cache when it changes (dev testing)
chrome.storage.onChanged.addListener(function(changes, namespace){
    if (changes.cacheMarks) {
        console.log(changes.cacheMarks.newValue);
    }
});
/* --- */


// if a bookmark is removed locally,
// remove it from the server, too
chrome.bookmarks.onRemoved.addListener(function(removed){
    $removed = removed.toString();

    // grab current user key
    chrome.storage.sync.get('userKey',function(data){
        $user_id = data.userKey;
    });

    // check if the object removed was the folder
    // and grab the current folder id
    chrome.storage.sync.get('folder_id',function(data){
        if (removed == data.folder_id) {
            chrome.storage.sync.set({
                'folder_id': ''
            });
            getFolder();
            alert('Synced folder reset!');
        }
        $folder = data.folder_id;
    });

    // check removed id against dropmarks cache
    chrome.storage.local.get('cacheMarks',function(cache){
        $cache = cache['cacheMarks'];

        // Prep the json object to send to the server
        var remData = {};
            remData.request = "rem_mark";
            remData.user = $user_id;

        for (var i = 0; i < $cache.length; i++) {
            if ($cache[i][0] == $removed) {
                // found the url in the cache
                remData.url = $cache[i][1];
            }
        }

        // send it off to the server!
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8888/dropmarks/dropmarks.php',
            data: remData,
            dataType: 'json',
            success: function(data) {
                // now that the server is updated,
                // refresh the local cache to reflect
                // the removed mark
                chrome.runtime.getBackgroundPage(function(bg){
                    bg.cacheMarks();
                });
            }
        });
    });
});
/* --- */