// Generate a randomized alphanum string by length
function keyGen(len) {
    var text = '';
    var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for ( var z=0; z < len; z++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text;
}

// Save/Restore via chrome.storage.sync
var key_field = document.getElementById('user_key');

function save_options() {
    chrome.storage.sync.set({
        'userKey': key_field.value
    });
}

function restore_options() {
    chrome.storage.sync.get('userKey', function(data){
        key_field.value = data.userKey;
        var savedKey = data.userKey;
    });
}

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

    // Grab user data from server
    $('#grab_json').click(function(){
        console.log('click!');
        $.getJSON('http://localhost:8888/dropmarks/'+savedKey+'.json', function(data){
            console.log(data);
        });
    });
});