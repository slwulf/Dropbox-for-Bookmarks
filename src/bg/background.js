function keyGen(len) {
    var text = '';
    var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for ( var z=0; z < len; z++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text;
}

var settings = new Store("settings", {
    "test": "This is a test."
});