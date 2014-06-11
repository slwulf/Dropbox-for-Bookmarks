function addMark(user, url, title) {
    var data = {};
        data.request = 'add_mark';
        data.user = user;
        data.url = url;
        data.title = title;

    $.ajax({
        type: 'POST',
        url: 'http://localhost:8888/dropmarks/dropmarks.php',
        data: data,
        dataType: 'json',
        success: function result(data) {
            console.log(data);
        }
    });
}

$(document).ready(function(){

    bg = chrome.extension.getBackgroundPage();

    chrome.storage.sync.get('userKey', function(data){
        user_key = data.userKey;
    });

    // First, get the bookmark metadata for the current tab.
    chrome.tabs.getSelected(null, function(tab){
        $page = tab.url;
        $title = tab.title;

        $('#title').val($title);
        $('#url').val($page);
    });

    // Next, check for a Dropmarks folder.
    chrome.storage.sync.get('folder_id', function(data){
        console.log(data.folder_id);
        if ( data.folder_id == '' || ! data.folder_id ) {
            chrome.bookmarks.create({
                'title': 'Dropmarks'
            }, function(newFolder){
                $folder = newFolder.id;
                chrome.storage.sync.set({
                    'folder_id': newFolder.id
                });
            });
        } else {
            $folder = data.folder_id;
        }
    });

    $('#save').click(function(){
        chrome.bookmarks.create({
            'parentId': $folder,
            'title': $('#title').val(),
            'url': $('#url').val()
        },
        function(newMark){
            addMark(user_key, newMark.url, newMark.title);
            $('#mainPopup').append('Saved "'+ newMark.title +'" to Dropmarks folder.');
        });
    });

});