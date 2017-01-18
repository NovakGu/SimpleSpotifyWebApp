"use strict";

// An anonymous function that is executed passing "window" to the
// parameter "exports".  That is, it exports startApp to the window
// environment.
(function(exports) {
	var client_id = '2873a4dfa8184771905508d79f248cf2';		// Fill in with your value from Spotify
	var redirect_uri = 'http://localhost:3000/index.html';
	var g_access_token = '';

	/*
	 * Get the playlists of the logged-in user.
	 */


	 function setCharAt(str,index,chr) {
	     if(index > str.length-1) return str;
	     return str.substr(0,index) + chr + str.substr(index+1);
	 }

	 function createTagObject(name){
		 if(name=='one'){
			 var taggedSong = ["Aqualung", "Your Time Will Come", "Circle of Light", "Digging For Some Words", "Wake Up and Rise"];
			 var newTag = {TagName:name,
			 							TagSong:taggedSong};
		 }
		 else if(name=='two'){
			 var taggedSong = ["Great Heart", "Locomotive Breath", "Rebel", "Wake Up and Rise", "Your Time Will Come"];
			 var newTag = {TagName:name,
									 TagSong:taggedSong};
		 }
		 else if(name=='three'){
			 var taggedSong = ["Mama is a Revolutionary", "Why Don't You Do Right", "Your Time Will Come", "Wind Up"];
			 var newTag = {TagName:name,
									 TagSong:taggedSong};
		 }
		 else{
			 var taggedSong = [];
			 var newTag = {TagName:name,
			 							TagSong:taggedSong};
		 }

		 return newTag;
	 }

function getStoredTags(){
	//console.log('getJSONLOG');
	//alert(localStorage.getItem("TagStorage") === null);
if(localStorage.getItem("TagStorage") === null){
	$.getJSON("Tag.json", function(json){
	//	console.log(json);
		var tags = [];
		var length = 3;
		for(var i = 0; i < length; i++){
			tags.push(createTagObject(json.Tags[i].name));
		}
		//console.log(tags);
		var json_str = JSON.stringify(tags);
		localStorage.setItem('TagStorage',json_str);
	});
}

	var getStorage = localStorage.getItem('TagStorage');
	var tt = JSON.parse(getStorage);
	//console.log(getStorage);
	if(tt==null){
		location.reload();
	}
	var len = tt.length;

	for(var i = 0; i<len;i++){
		$('#tags').append('<button class = "tagbtn" onclick=TagPage(\'' + tt[i].TagName + '\')>' +  tt[i].TagName + '</button>');
	}
$('#tags').append('<button class = "tagbtn" onclick=openNewTagPage()>+</button>');
}




	function getPlaylist(callback, var1) {
	//	console.log('getsinglePlaylist');
		var url = 'https://api.spotify.com/v1/users/cs349/playlists/' + var1;
		$.ajax(url, {
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + g_access_token
			},
			success: function(r) {
				//console.log('got playlist response', r);
				callback(r);
			},
			error: function(r) {
				callback(null);
			}
		});
	}



	function getPlaylists(callback) {
		//console.log('getPlaylists');
		var url = 'https://api.spotify.com/v1/users/cs349/playlists';
		$.ajax(url, {
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + g_access_token
			},
			success: function(r) {
			//	console.log('got playlist response', r);
				callback(r.items);
			},
			error: function(r) {
				callback(null);
			}
		});
	}

	function getPlaylistTracks(callback, var1) {
	//	console.log('getTracks');
		var url1 = 'https://api.spotify.com/v1/users/cs349/playlists/'+var1+ '/tracks';
		$.ajax(url1, {
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + g_access_token
			},
			success: function(r){
			//	console.log('got track response', r);
				var len = r.items.length;
				var storageName;
				var playlistJson = localStorage.getItem('PlaylistStorage');
				var parsedlist = JSON.parse(playlistJson);
			//	console.log('why!',parsedlist);
				var lenlist = parsedlist.length;
				for(var i = 0; i <lenlist; i++){
					var id  = parsedlist[i].Id.toString();
					if (var1 == id){
						storageName = parsedlist[i].PlayListName.toString();
					}
				}

				var arr = [];
				for(var i = 0; i<len; i++){
					var trackname = r.items[i].track.name;
					for (var j = 0, leng = trackname.length; j<leng;j++){
						if(trackname[j]==' '){
						 trackname = setCharAt(trackname,j,'_');
						}
						if(trackname[j]=='\''){
						 trackname = setCharAt(trackname,j,'_');
						}
					}
				//	alert(trackname);
					var TagList = [];
					var trackObject = {TrackName:r.items[i].track.name,
														TrackNameParsed: trackname,
														TrackRatings: 0,
														TrackTags: TagList};
					arr.push(trackObject);
				}
				var jsonfile = JSON.stringify(arr);
				localStorage.setItem(storageName,jsonfile);
			//	console.log(storageName);
			//	console.log('this is a test', arr);
				callback(r.items);
			},
			error: function(r){
				callback(null);
			}
		});
	}

	var doLogin = function(callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
			'&response_type=token' +
			'&scope=playlist-read-private' +
			'&redirect_uri=' + encodeURIComponent(redirect_uri);

		console.log("doLogin url = " + url);
		window.location = url;
	}

	/*
	 * What to do once the user is logged in.
	 */
	function loggedIn() {
		$('#login').hide();
		$('#loggedin').show();
		$('#sideMenu').show();
		$('#playlist').hide();
		$('#allsong').hide();
		$('#allTags').hide();
		$('#targetTag').hide();
		$('#newTag').hide();
		$('#search').hide();
		getPlaylists(function(items) {
				//console.log('items = ', items);
				items.forEach(function(item){
					var PlayListName = item.name;
					for (var i = 0, len = PlayListName.length; i<len;i++){
						//alert(trackname[i]);
						if(PlayListName[i]==' '){
						 PlayListName = setCharAt(PlayListName,i,'_');
						}
					}

					//$('#playlists').append('<li>' + item.name + '</li>');
					//$('#playlists').append('<img src=' + item.images[0].url + ' hieght="200px" width="200px">');
					$('#playlists').append('<button class="playlistbtn" onclick="showPlayLists(\'' + PlayListName + '\')"><span id="list">' + item.name + '</span></button>');
				});
				//alert(localStorage.getItem("PlaylistStorage") === null);
		//	if(localStorage.getItem("PlaylistStorage") === null){
				var PlaylistArr = [];
				var len = items.length;
				for(var i = 0; i < len; i++){
				//	alert(items[i].href);
					var playlistObject = {PlayListName:items[i].name,
					Href:items[i].href,
					Id:items[i].id};
					PlaylistArr.push(playlistObject);
				//}

				var json_str = JSON.stringify(PlaylistArr);
				localStorage.setItem('PlaylistStorage',json_str);
				}

			/*	$.ajax({
					url:'http://localhost:3000/playlist',
					dataType: 'json',
					type: 'post',
					data: json_str
				});

				var testajax;
				$.ajax({
					url:'http://localhost:3000/playlist',
					dataType: 'json',
					//type: 'get',
					data: testajax
				});
				var parseajax = JSON.parse(testajax);*/

			///	console.log('testajax',parseajax);
				//test purpose
					var test = localStorage.getItem('PlaylistStorage');
					var test1 = JSON.parse(test);
					//console.log('this is playlist storage', test1);

				//test purpose

			});

			var playLst = localStorage.getItem('PlaylistStorage');
			var parseList = JSON.parse(playLst);
			//console.log('WTF',parseList);
			if(parseList==null){
				location.reload();
			}
			var len = parseList.length;
			var testArr = [];
			for(var i = 0; i < len; i++){
				var playlistTrack = [];
				getPlaylistTracks(function(item){
					//	console.log('items =', item);
						var TagList = [];
						testArr = item.track;
						var jsontest = JSON.stringify(testArr);
						localStorage.setItem(i.toString(),jsontest);
							item.forEach(function(item){
								var trackname = item.track.name;
								for (var j = 0, len = trackname.length; j<len;j++){
									if(trackname[j]==' '){
									 trackname = setCharAt(trackname,j,'_');
									}
									if(trackname[j]=='\''){
									 trackname = setCharAt(trackname,j,'_');
									}
								}
								var trackObject = {TrackName:item.track.name,
																	TrackParseName: trackname,
																	TrackRatings: 0,
																	TrackTags: TagList};
								playlistTrack.push(trackObject);
							//	$('track0').append('<button class="trackbtn"><span id="'+ trackname + '">' + item.track.name + '</span></button>');
							//	alert('<button class="trackbtn"><span id="'+ trackname + '">' + item.track.name + '</span></button>');
							});
							var storageName = 'playList' + i.toString();
							//alert(playlistTrack);
							//console.log('all songs:', playlistTrack);
							var playListJson = JSON.stringify(playlistTrack);
							localStorage.setItem('allSongs',playListJson);
				},(parseList[i].Id).toString());

			}

			var allSongs = localStorage.getItem('allSongs');
			var parseAllSongs = JSON.parse(allSongs);
			if(parseAllSongs==null){
				location.reload();
			}
			var jsonLen = parseAllSongs.length;
			for(var i = 0; i < jsonLen; i++){
 $('#allsongs').append('<button class="trackbtn"><span id="track" onclick="openTrackNav(\'' + parseAllSongs[i].TrackName + '\')">' + parseAllSongs[i].TrackName + '</span></button>');
			//	$('#allsongs').append('<button class="trackbtn"><span id="'+ parseAllSongs[i].TrackParseName + '">' + parseAllSongs[i].TrackName + '</span></button>');
			}




		/*getPlaylistTracks(function(item) {
			console.log('items = ', item);
			item.forEach(function(item){
				var trackname = item.track.name;
				for (var i = 0, len = trackname.length; i<len;i++){
					//alert(trackname[i]);
					if(trackname[i]==' '){
					 trackname = setCharAt(trackname,i,'_');
					}
				}

				//alert(trackname);
				//$('#tracks').append('<li>' + item.track.name + '</li>');
				//$('#tracks').append('<img src=' + item.track.album.images[0].url + ' hieght="200px" width="200px">');
				$('#tracks').append('<button class="trackbtn"><span id="'+ trackname + '">' + item.track.name + '</span></button>');
			});
		}, var1);


		getPlaylistTracks(function(item) {
			console.log('items = ', item);
			item.forEach(function(item){
				var trackname = item.track.name;
				for (var i = 0, len = trackname.length; i<len;i++){
					//alert(trackname[i]);
					if(trackname[i]==' '){
					 trackname = setCharAt(trackname,i,'_');
					}
				}
				//alert(trackname);
				//$('#tracks').append('<li>' + item.track.name + '</li>');
				//$('#tracks').append('<img src=' + item.track.album.images[0].url + ' hieght="200px" width="200px">');
				$('#tracks2').append('<button class="trackbtn"><span id="'+ trackname + '">' + item.track.name + '</span></button>');
			});
		}, var2);


		getPlaylistTracks(function(item) {
			console.log('items = ', item);
			item.forEach(function(item){
				var trackname = item.track.name;
				for (var i = 0, len = trackname.length; i<len;i++){
					//alert(trackname[i]);
					if(trackname[i]==' '){
					 trackname = setCharAt(trackname,i,'_');
					}
					if(trackname[i]=='\''){
					 trackname = setCharAt(trackname,i,'_');
					}
				}
				$('#track3').append('<button class="trackbtn"><span id="'+ trackname + '">' + item.track.name + '</span></button>');
			});
		}, var3);*/


getStoredTags();
		// Post data to a server-side database.  See
		// https://github.com/typicode/json-server
		var now = new Date();
		$.post("http://localhost:3000/demo", {"msg": "accessed at " + now.toISOString()}, null, "json");
	}

	/*
	 * Export startApp to the window so it can be called from the HTML's
	 * onLoad event.
	 */
	exports.startApp = function() {
		//console.log('start app.');

	//	console.log('location = ' + location);

		// Parse the URL to get access token, if there is one.
		var hash = location.hash.replace(/#/g, '');
		var all = hash.split('&');
		var args = {};
		all.forEach(function(keyvalue) {
			var idx = keyvalue.indexOf('=');
			var key = keyvalue.substring(0, idx);
			var val = keyvalue.substring(idx + 1);
			args[key] = val;
		});
	//	console.log('args', args);

		if (typeof(args['access_token']) == 'undefined') {
			$('#start').click(function() {
				doLogin(function() {});
			});
			$('#login').show();
			$('#loggedin').hide();
		} else {
			g_access_token = args['access_token'];
			loggedIn();
		}
	}

})(window);
function openNav(){
	document.getElementById("sidenav").style.width = "20%";
	document.getElementById("loggedin").style.marginLeft = "20%";
}

function closeNav(){
	document.getElementById("sidenav").style.width = "0";
	document.getElementById("loggedin").style.marginLeft = "0";
}

function showPlayList(){
	$('#playlist').show(500);
	$('#allsong').hide();
	$('#allTags').hide();
	$('#targetPlaylist').hide();
	$('#targetTag').hide();
	$('#newTag').hide();
	$('#search').hide();
}

function showAllSongs(){
	$('#playlist').hide();
	$('#allsong').show();
	$('#allTags').hide();
	$('#targetPlaylist').hide();
	$('#targetTag').hide();
	$('#newTag').hide();
	$('#search').hide();
}

function showAllTags(){
	$('#playlist').hide();
	$('#allsong').hide();
	$('#allTags').show(500);
	$('#tag1').hide();
	$('#targetPlaylist').hide();
	$('#targetTag').hide();
	$('#newTag').hide();
	$('#search').hide();
}

function showAll(){
	$('#playlist').show();
	$('#allsong').show();
	$('#allTags').show();
	$('#targetPlaylist').hide();
	$('#targetTag').hide();
	$('#newTag').hide();
	$('#search').hide();
}

function hideAll(){
	$('#playlist').hide();
	$('#allsong').hide();
	$('#allTags').hide();
	$('#targetPlaylist').hide();
	$('#targetTag').hide();
	$('#newTag').hide();
	$('#search').hide();
}

function showSearch(){
	$('#playlist').hide();
	$('#allsong').hide();
	$('#allTags').hide();
	$('#targetPlaylist').hide();
	$('#targetTag').hide();
	$('#newTag').hide();
	$(re).empty();
	$('#search').show();
}

 function showPlayLists(name){
	 var showPlaylistJson = localStorage.getItem(name);
	 var parsed =JSON.parse(showPlaylistJson);
	 	$(target).empty();
		var len  = parsed.length;
		for(var i = 0; i<len; i++){
			 $('#target').append('<button class="trackbtn"><span id="track" onclick="openTrackNav(\'' + parsed[i].TrackName + '\')">' + parsed[i].TrackName + '</span></button>');
		}
	$('#playlist').hide();
	$('#allsong').hide();
	$('#allTags').hide();
	$('#targetPlaylist').show();
	$('#targetTag').hide();
	$('#newTag').hide();
	$('#search').hide();
}

function showPlayList(){
	$('#playlist').show();
	$('#allsong').hide();
	$('#allTags').hide();
	$('#targetPlaylist').hide();
		$('#targetTag').hide();
		$('#newTag').hide();
		$('#search').hide();

}

function openTrackNav(name){
	document.getElementById('trackNav').style.width="100%";
	document.getElementById('loggedin').style.marginTop="0%";

	$(trackInfo).empty();
	$('#trackInfo').append('<a herf="#">'+name+'</a>');
$('#trackInfo').append('<input type="text" id="TNameInput" value="assign Tags">');
	$('#trackInfo').append('<button onclick="aTag(\'' + name + '\')">Submit</button>');
$('#trackInfo').append('<input type="text" id="RatingInput" value="assign Ratings">');
$('#trackInfo').append(	'<button onclick="aRating(\'' + name + '\')">Submit</button>');
}
function closeTrackNav(){
	document.getElementById("trackNav").style.width = "0";
	 document.getElementById("loggedin").style.marginTop= "0";
}

function assignTags(Songname, Tagname){
	var getStorage = localStorage.getItem('TagStorage');
	var tt = JSON.parse(getStorage);
	var len = tt.length;
	var Tag = Tagname.toString();
	var insertIndex =-1;
	for(var i = 0; i<len; i++){
		if(tt[i].TagName == Tag){
			insertIndex = i;
		}
	}
	if(insertIndex>=0){
		tt[insertIndex].TagSong.push(Songname);
		var string_tt = JSON.stringify(tt);
		localStorage.setItem('TagStorage',string_tt);
		var getsong = localStorage.getItem('allSongs');
		var allsong = JSON.parse(getsong);
		var slen = allsong.length;
		var song = Songname.toString();
		var index;
		for(var i = 0; i<slen; i++){
			if(allsong[i].TrackName == song){
				index = i;
			}
		}
		allsong[index].TrackTags.push(Tag);
		var string_s = JSON.stringify(allsong);
		localStorage.setItem('allSongs',string_s);
	}
	else{
		alert('Invalid tag');
	}
}

function assignRatings(name, rating){
	var parseRating = parseInt(rating);
	if(rating>=0 && rating<=5){
		var getsong = localStorage.getItem('allSongs');
		var allsong = JSON.parse(getsong);
		var slen = allsong.length;
		var song = name.toString();
		var index;
		for(var i = 0; i<slen; i++){
			if(allsong[i].TrackName == song){
				index = i;
			}
		}
		allsong[index].TrackRatings=parseRating;
		var string_s = JSON.stringify(allsong);
		localStorage.setItem('allSongs',string_s);
		//console.log('allSongs',allsong);
	}
	else{
		alert('Invalid Rating, please enter 1 - 5')
	}
//	console

}


function TagPage(name){
	var toString = name.toString();
	var getTags = localStorage.getItem('TagStorage');
	var parseTag = JSON.parse(getTags);
	var tagLen = parseTag.length;
	var targetTrackArr = [];
	var tagindex;
	for(var i =0; i<tagLen; i++){
		if(parseTag[i].TagName == toString){
			targetTrackArr = parseTag[i].TagSong;
			tagindex = i;
		}
	}
	$(tagPage).empty();
	if (targetTrackArr[0] != null) {
		var songlen = parseTag[tagindex].TagSong.length;
			//console.log('parsedTag',parseTag);
		for(var j = 0 ;j<songlen;j++){

			$('#tagPage').append('<li>"'+ parseTag[tagindex].TagSong[j]  +'"</li>');
		}
$('#tagPage').append('<button class = "tagbtn" onclick=deleteTag(\'' + tagindex + '\')>Delete Tag</button>')
	}
	else{
		$('#tagPage').append('<li>There are no songs in this tag, go add some!</li>');
		$('#tagPage').append('<button class = "tagbtn" onclick=deleteTag(\'' + tagindex + '\')>Delete Tag</button>')
	}
	$('#playlist').hide();
	$('#allsong').hide();
	$('#allTags').hide();
	$('#targetPlaylist').hide();
		$('#targetTag').show();
		$('#newTag').hide();
		$('#search').hide();

}

function newTagPage(){
	var input = document.getElementById("TagNameInput").value;
	newTag(input);
}

function aTag(SongName){
	var input = document.getElementById("TNameInput").value;
	assignTags(SongName, input);
}

function aRating(SongName){
	var input = document.getElementById("RatingInput").value;
	assignRatings(SongName, input);
}

function openNewTagPage(){
	$('#playlist').hide();
	$('#allsong').hide();
	$('#allTags').hide();
	$('#targetPlaylist').hide();
		$('#targetTag').hide();
		$('#newTag').show();
		$('#search').hide();
}


function deleteTag(index){
	var number = parseInt(index);
//	alert(number);
	var getStorage = localStorage.getItem('TagStorage');
	var tt = JSON.parse(getStorage);
	var removed = tt.splice(number,1);
	var len = tt.length;
	$(tags).empty();
	for(var i = 0; i<len;i++){
		$('#tags').append('<button class = "tagbtn" onclick=TagPage(\'' + tt[i].TagName + '\')>' +  tt[i].TagName + '</button>');
	}
	$('#tags').append('<button class = "tagbtn" onclick=openNewTagPage()>+</button>');
	var json_str = JSON.stringify(tt);
	localStorage.setItem('TagStorage',json_str);

}



function newTag(TagN){
//	alert("in");
	var getStorage = localStorage.getItem('TagStorage');
	var tt = JSON.parse(getStorage);
	var taggedSong = [];
	//console.log(tt);
	var name = TagN;
	var oldlen = tt.length;
	var skip = false;
	for(var i = 0; i<oldlen; i++){
		if(tt[i].TagName == TagN.toString()){
			alert('TagName already exist!');
			skip = true;
		}
	}
	if(!skip){
		var newa = {TagName:TagN,
								TagSong:taggedSong};
								tt.push(newa);
								var len = tt.length;
								$(tags).empty();
								for(var i = 0; i<len;i++){
									$('#tags').append('<button class = "tagbtn" onclick=TagPage(\'' + tt[i].TagName + '\')>' +  tt[i].TagName + '</button>');
								}
								$('#tags').append('<button class = "tagbtn" onclick=openNewTagPage()>+</button>');
								var json_str = JSON.stringify(tt);
								localStorage.setItem('TagStorage',json_str);
	}
}

function parseSearch(input){
	var search = [];
	var inputS = input.toString();
	var startIndex=0;
	var endIndex=0;
	var len = inputS.length;
	var commaIndex=[];
	for(var i =0; i<len; i++){
		if(inputS[i]==','){
			commaIndex.push(i);
		}
	}
	var tagsNumber = commaIndex.length;
	for(var i =0;i<=tagsNumber;i++){
		if(i==tagsNumber){
			var TagsName = inputS.substring(startIndex,len);
			search.push(TagsName);
			//alert(TagsName);
		}
		else{
			var TagsName = inputS.substring(startIndex,commaIndex[i]);
			search.push(TagsName);
			//alert(TagsName);
			startIndex = commaIndex[i]+1;
		}
	}

	return search;
}

function NewTagSearch(){
	$(re).empty();
	var input = document.getElementById("TagSearchInput").value;
	var tags = parseSearch(input);
	var result = [];
	var getStorage = localStorage.getItem('TagStorage');
	var tt = JSON.parse(getStorage);
	var len = tt.length;

	for(var i =0; i<tags.length; i++){

		for(var j =0; j<len;j++){
			//alert(tags[i]);
			//alert(tt[j].TagName);
			if(tags[i] == tt[j].TagName){

				result.push(tt[j].TagSong);
				break;
			}
		}
	}
	//console.log('!!!!',result);
	for(var i=0; i<result.length; i++){
		for(var j=0; j<result[i].length; j++){
			$('#re').append('<li>'+result[i][j]+'</li>');
		}
	}
}
function NewRatingSearch(){
		$(re).empty();
	var input = document.getElementById("RatingSearchInput").value;
	var intRating = parseInt(input);
	var getStorage = localStorage.getItem('allSongs');
	var song = JSON.parse(getStorage);
	var len = song.length;
	var res= [];
	for(var i =0; i<len; i++){
		var songRating = parseInt(song[i].TrackRatings);
		if(songRating>=intRating){
			res.push(song[i].TrackName);
		}
	}

	for(var i=0; i<res.length; i++){
		$('#re').append('<li>'+res[i]+'</li>');
	}

}
