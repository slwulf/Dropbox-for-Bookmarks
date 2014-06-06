function addMark(user, url, title) {
    var data = {};
        data.request = 'add_mark';
        data.user = user;
        data.url = url;
        data.title = title;

    $.ajax({
        type: 'POST',
        url: 'http://www.thatbrightrobot.com/dropmarks/dropmarks.php',
        data: data,
        dataType: 'json',
        success: function result(data) {
            console.log(data);
        },
        error: function result(data, XMLHttpRequest, errorThrown, textStatus) {
            console.log(data);
            console.log(errorThrown);
            console.log(XMLHttpRequest);
            console.log(textStatus);
        }
    });
}

$(document).ready(function(){

    var bg = chrome.extension.getBackgroundPage();

    chrome.storage.sync.get('userKey', function(data){
        user_key = data.userKey;
        console.log(user_key);
    });

    // First, get the bookmark metadata for the current tab.
    chrome.tabs.getSelected(null, function(tab){
        $page = tab.url;
        $title = tab.title;

        $('#title').val($title);
        $('#url').val($page);
    });

    // Next, check for a Dropmarks folder.
    chrome.bookmarks.getTree(function(search){
        $dropmarks = false;
        $dm_id = 0;

        $children = search[0].children;
        // Check if Dropmarks exists in any of the top level folders.
        for (var i = 0; i < $children.length; i++) {
            if ($children[i].title == 'Dropmarks') {
                $dropmarks = true;
                $dm_id = $children[i].id;
            } else {
                // If not, check if it's one level below.
                $sub = $children[i].children;
                for (var x = 0; x < $sub.length; x++) {
                    if ($sub[x].title == 'Dropmarks') {
                        $dropmarks = true;
                        $dm_id = $sub[x].id;
                    }
                }
            }
        }

        // If Dropmarks folder still can't be found, create it in "Other Bookmarks".
        if ( $dropmarks !== true ) {
            chrome.bookmarks.create({
                'title': 'Dropmarks'
            }, function(newFolder){
                $dm_id = newFolder.id;
            });
        }
    });

    $('#save').click(function(){
        chrome.bookmarks.create({
            'parentId': $dm_id,
            'title': $('#title').val(),
            'url': $('#url').val()
        },/* This creates a json object of all links in the folder.
        function(newMark){
            console.log('id: '+ newMark.parentId);
            chrome.bookmarks.getChildren(newMark.parentId, function(results){
                console.log(results);
            });
        }*/
        function(newMark){
            console.log('key: '+user_key+' url: '+newMark.url+' title: '+newMark.title);
            addMark(user_key, newMark.url, newMark.title);
            console.log('Saved "'+ newMark.title +'" to Dropmarks folder.');
        });
    });

});