function keyGen(len) {
    var text = '';
    var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for ( var z=0; z < len; z++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text;
}

var key_field = document.getElementById('user_key');
var reset = document.getElementById('key_reset');

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
    restore_options();

    if ( savedKey == '' ) {
        var user_key = keyGen(8);
        key_field.value = user_key;
        save_options();
        restore_options();
    }
});