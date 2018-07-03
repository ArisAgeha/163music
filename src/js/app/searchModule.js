var query = new AV.SearchQuery('SongList');
query.queryString('name:星');
query.find().then(function(results) {
    console.log('-----')
    console.log(results);
    //Process results
});

