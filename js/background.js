// Function for syncing bookmarks
function syncMarks(savedKey) {
    /*chrome.bookmarks.remove('', function(){
        console.log('removed all');
    });*/

    $.getJSON('http://localhost:8888/dropmarks/'+savedKey+'.json', function(data){
        for (var i = 0; i < data.length; i++) {
            // check if bookmark exists. if not, add it.
            console.log('Title: '+ data[i].title +' URL: '+ data[i].url);
        }
    });
}



// Function to check for and create Dropmarks folder
function getFolder() {
    // Check for a Dropmarks folder.
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

        chrome.storage.sync.set({
            'folder_id': $dm_id
        });
    });
}

$(document).ready(function(){
    getFolder();
});