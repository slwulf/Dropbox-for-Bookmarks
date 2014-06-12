// Set background page for bg functions
chrome.runtime.getBackgroundPage(function(bgPage){
    bg = bgPage;
});
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



// doc init
document.addEventListener('DOMContentLoaded', function(){
    // Try to restore options from chrome.storage.sync
    restore_options();

    // If restore_options() didn't set savedKey, generate a userkey.
    if ( savedKey === '' ) {
        var user_key = keyGen(8);
        key_field.value = user_key;
        save_options();
        restore_options();
    }

    // Update user key
    $('#update_key').click(function(){
        save_options();
        restore_options();
        chrome.runtime.getBackgroundPage(function(bg){
            bg.syncMarks(key_field.value);
            bg.cacheMarks();
            $('.status').slideUp().remove();
            $('body').append('<p class="status" style="display:none;">Bookmarks synced!</p>');
            $('.status').slideDown();
        });
    });
});