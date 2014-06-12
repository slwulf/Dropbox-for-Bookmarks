function addMark(user, url, title, id) {
    var data = {};
        data.request = 'add_mark';
        data.user = user;
        data.url = url;
        data.title = title;
        data.id = id;

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

    chrome.runtime.getBackgroundPage(function(bgPage){
        bg = bgPage;
    });

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
        $folder = data.folder_id;
    });

    $('#save').click(function(){
        chrome.bookmarks.create({
            'parentId': $folder,
            'title': $('#title').val(),
            'url': $('#url').val()
        },
        function(newMark){
            addMark(user_key, newMark.url, newMark.title, newMark.id);
            chrome.runtime.getBackgroundPage(function(bg){
                bg.cacheMarks();
            });
            
            $('#mainPopup').append('Saved "'+ newMark.title +'" to Dropmarks folder.');
        });
    });

});