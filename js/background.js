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
        for (var i = 0; i < rem.length; i++) {
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
        $dropmarks = getFolder();
        chrome.storage.sync.set({
            'folder_id': $dropmarks
        });
        alert('Updated from '+ details.previousVersion +' to '+ thisVersion +'!');
    }

    chrome.storage.sync.get('userKey',function(data){
        $user_id = data.userKey;
    });
});

// check for new bookmarks on startup
chrome.runtime.onStartup.addListener(function(){
    chrome.storage.sync.get('userKey',function(data){
        syncMarks(data.userKey);
    });
});

// if a bookmark is removed locally,
// remove it from the server, too
chrome.bookmarks.onRemoved.addListener(function(removed){
    chrome.storage.sync.get('userKey',function(data){
        $user_id = data.userKey;
    });

    var data = {};
        data.request = 'rem_mark';
        data.user = $user_id;
        data.id = removed;

    $.ajax({
        type: 'POST',
        url: 'http://localhost:8888/dropmarks/dropmarks.php',
        data: data,
        dataType: 'json',
        success: function result(data) {
            console.log(data);
        }
    });
});