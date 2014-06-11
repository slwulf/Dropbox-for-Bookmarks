// Set background page for bg functions
chrome.runtime.getBackgroundPage(function(bgPage){
    bg = bgPage;
});

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


// Save/Restore via chrome.storage.sync
var key_field = document.getElementById('user_key'),
    savedKey = 'savedKey';
chrome.storage.sync.get('folder_id', function(data){
    $folder = data.folder_id;
});

function save_options() {
    chrome.storage.sync.set({
        'userKey': key_field.value
    });
}

function restore_options() {
    chrome.storage.sync.get('userKey', function(data){
        key_field.value = data.userKey;
        savedKey = data.userKey;
    });
}
/* --- */


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


// doc init
document.addEventListener('DOMContentLoaded', function(){
    // Try to restore options from chrome.storage.sync
    restore_options();

    // If restore_options() didn't set savedKey, generate a userkey.
    if ( savedKey == '' ) {
        var user_key = keyGen(8);
        key_field.value = user_key;
        save_options();
        restore_options();
    }

    // Update user key
    $('#update_key').click(function(){
        save_options();
        restore_options();
    });

    // Grab user data from server
    $('#grab_json').click(function(){
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
                    console.log('local synced to server!');
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
                    console.log('local now synced to server!');
                }
            });
        });
    });
});