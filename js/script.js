/**
 * @author Lekan Ikotun
 */

var rssfeedlink, rssfeedimg, rssfeedtitle, feedId, faceBlock, nooffeed= 10;

$.searchObj = function(faveRSSObj, linkval) {
	var faveArr = JSON.parse(faveRSSObj);
	var tempArray = faveArr.filter(function(fval) {return fval.link == linkval});
	//if link does not exist in array
	if (tempArray.length === 0) {
		//return faveArr;
		return true;
	} else {  //if link exists in array
		return false;
	}
}

function closeConfigureRSS() {
	$('#backdrop').fadeOut(200, function() {
		$('#backdropcontainer').animate({'opacity':'0'}, 200, 'linear');
	});
	$('#backdropcontainer').remove();
}

function configureRSS(url) {
	$('#faveblock').slideUp(200);
	var val = localStorage.getItem('rssarray');	
	val = val.split(",");
	var html = '<div id="backdropcontainer"><form id="rssconfigure">';
	$.getJSON(url, function(data) {
		$.each(data, function(i, entry) {
			if(($.inArray(entry.title, val)) >= 0) {
				html += '<input type="checkbox" name="'+entry.title+'" id="'+entry.title+'" value="'+entry.link+'" checked="checked"><label for="'+entry.title+'">'+entry.title+'</label><br/>';
			} else {
				html += '<input type="checkbox" name="'+entry.title+'" id="'+entry.title+'" value="'+entry.link+'"><label for="'+entry.title+'">'+entry.title+'</label><br/>';
			}
		});
		html += '<button id="save">Save</button><button id="cancel">Cancel</button></form></div>';
		$('body').append(html);	
	});

	$('#backdrop').fadeIn(200, function() {
		$('#backdropcontainer').animate({'opacity':'1.0'}, 100, 'linear');
	});
}

//load configure rss feeds or set default
function loadRSS() {
	var rssarray = [];
	if(('localStorage' in window) && window['localStorage'] !== null){
		var val = localStorage.getItem('formvalues');
		if (val!= null && val!="undefined") {
			var storedval = JSON.parse(val);
			$.each(storedval, function(i, formval) {
				fetchRSS(storedval[i].name, storedval[i].value);
				rssarray.push(storedval[i].name);
			});
			localStorage.setItem('rssarray', rssarray);
		} else {
			$.getJSON('feed.json', function(data) {
				$.each(data, function(i, entry) {
					fetchRSS(entry.title, entry.link);
					rssarray.push(entry.title);
				});
				localStorage.setItem('rssarray', rssarray);
			});
		}
	}
}

function loadFaveRSS() {
	if(('localStorage' in window) && window['localStorage'] !== null){
		var val = localStorage.getItem('faveRSS');
		if (val!= null && val!="undefined") {
			var storedval = JSON.parse(val);
			var faveBlock="";
			$.each(storedval, function(i, formval) {
				var faveunit = dispFaveRSS(storedval[i].title, storedval[i].link, storedval[i].image);
				faveBlock += faveunit;
			});
		} else {
			return false;
		}
		$('#favebody').html(faveBlock);
	}
}

function dispFaveRSS(title, link, image) {
	var img;
	if (image == null || image ==="undefined") {
		img = "";
	} else {
		img = '<img width="80" src="'+image+'" />';
	}
	var fb = '<div class="faveblock clearfix"><img class="deleteicon" src="img/icons/deletered.png"/><a href="'+link+'" target="_blank">'+img+'<p>'+title+'</p></a></div><div></div>';
	return fb;
}

function fetchRSS(heading, url) {
	$.ajax({
		url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num='+nooffeed+'&callback=?&q='+encodeURIComponent(url),
		dataType: 'json',
		timeout: 1500,
		success: function(data) {
			processRSS(heading, data.responseData.feed);
		}
	});
}

function processRSS(heading, feed) {
	var rsspage = feedList="", entries = feed.entries;
	var identifier = feed.title.substring(0,4);
	for (var i = 0; i < entries.length; i++) {
		var imgcontent = '<div>'+ entries[i].content + '</div>';
		var rsspageid = identifier + (i+1);
		var mainImage= $(imgcontent).find('img');
		var rsssrc = $(mainImage[0]).attr('src');
		if (rsssrc == null || rsssrc ==="undefined") {
			var rssimg = "";
		} else {
			var rssimg = '<img width="100" src="'+rsssrc+'" />';
		}

		var feedTitle = entries[i].title.length > 130 ? entries[i].title.substring(0,129)+'...' : entries[i].title;
		feedList +='<div class="rdmore swiper-slide"><div><a href="' + rsspageid + '">'+rssimg+'<p>' + feedTitle + '</p></a></div></div>';
		var rssPageBlock = '<h2 class="maintitle">'+entries[i].title+'</h2>';
		rssPageBlock +='<div class="maincontent">'+entries[i].content+'</div>';
		rssPageBlock +='<div class="back"><p><a href="#">Back</a></p></div>';
		rssPageBlock +='<div class="mainlink"><p><a href="'+entries[i].link+'" target="_blank">Read full story...</a></p></div>';
		rsspage +='<div class="rsspage" id="'+rsspageid+'">'+rssPageBlock+'</div>';
	}

	$('.rssblock').append('<h2 id="'+identifier+'">' + heading + '</h2><div class="rssfeed swiper-container '+identifier+'"><div class="pagination-car"></div><div  class="swiper-wrapper" style="clear:both">' + feedList + '</div></div>');
	$('.rssfeed>div').css('width', 256*(entries.length));
	$('.rsspageblock').append('<div class="rsscontainer">'+rsspage+'</div></div>');
	var swiperCar = $('.'+identifier).swiper({
					slidesPerSlide : 4,
					speed: 1000,
					freeModeFluid: true
				});
}

function displayRSS(id) {
	var storedRSS = localStorage.getItem('faveRSS');
	rssfeedlink = $('#'+id+' .mainlink').find('a').attr('href');
	rssfeedimg = $('#'+id+' .maincontent').find('img').attr('src');
	rssfeedtitle = $('#'+id+' .maintitle').text();	
	$('#backdrop').fadeIn('fast', 'linear', function() {
		$('.rsspageblock').css('z-index','1001');
		$('.rsspageblock').animate({'margin-right':'0'}, 200, 'linear');
		$('#'+id).css({"z-index":"2000",'display':'block'});
		var favebgd = $.searchObj(storedRSS, rssfeedlink) ? "favorite.png" : "favorite-selected.png";	
		$('.favorite').css('background','url(img/icons/'+favebgd+') bottom left no-repeat');
	});
}

$(document).ready(function() {
	var origFaveVal = localStorage.getItem('faveRSS');
	if ( origFaveVal == null || origFaveVal == "undefined") {
		var emptyArr = [];
		localStorage.setItem('faveRSS', JSON.stringify(emptyArr));
	}
	loadRSS();

	//load configure RSS feed popup
	$('#configure').on('click', function(ev) {
		if (navigator.onLine) {
			configureRSS('feed.json');
			return false;
		} else {
			$('#errorblock').fadeIn(300).delay(1000).fadeOut(300);
			return false;
		}
	});

	//submit configure RSS feed form
	$('#rssconfigure').live('submit', function(ev){
			ev.preventDefault();
			var formvalues = $(this).serializeArray();
			localStorage.setItem('formvalues', JSON.stringify(formvalues));
			closeConfigureRSS();
			$('.rssblock').empty();
			$('.rsspageblock .rsscontainer').remove();
			loadRSS();
	});	

	$('#refresh').bind('click', function() {
		if (navigator.onLine) {
	    location.reload();
	  } else {
	  	$('#errorblock').fadeIn(300).delay(1000).fadeOut(300);
	  	return false;
	  }
	});

	//cancel configure rss feed form
	$('#cancel').live('click', function(ev) {
		ev.preventDefault();
		closeConfigureRSS();
	});	

	$('.rdmore').live('click', function(ev) {
		ev.preventDefault();
		$('#faveblock').slideUp(200);
		feedId = $(this).find('a').attr('href');
		displayRSS(feedId);
	});

	//toggle favorite list
	$('#favelist').live('click', function() {
		$('#faveblock').slideToggle(200);
		loadFaveRSS();
	});

	//display single news feed
	$('.back').live('click',function(ev) {
		$('.rsspageblock').animate({'margin-right':'-640px','z-index':'-10'}, 200, function() {
			$('#'+feedId).css('z-index', '-10');
			$('#shareblock, #backdrop').fadeOut();
		});
		return false;
	});

	//display email share popup
	$('.share').live('click', function(ev) {
		$('#shareblock').fadeIn(200);
		$('#shareblock>div').hide();
		$('#contactform').show();
		$('#form1 textarea').val('Your Friend would like to share this link with you...\n\n'+rssfeedlink);
	});

	$('.facebook').live('click', function(ev) {
		$('#shareblock').fadeIn(200);
		$('#shareblock>div').hide();
		$('#fblock, .cancel, .post, .message').show();
		$('.message').html('<p>Your Friend would like to share this link with you...</p>'+rssfeedlink);
	});

	$('.twitter').live('click', function(ev) {
		$('#shareblock').fadeIn(200);
		$('#shareblock>div').hide();
		$('#twblock, .cancel, .post, .message').show();
		$('.message').html('<p>Your Friend would like to share this link with you...</p>'+rssfeedlink);
	});

	//close email share popup
	$('.cancel, #cancelemail').live('click', function() {
		$('#shareblock').fadeOut(200);
	});
	
	//add favorite object to array
	$('.favorite').live('click', function(ev) {
		var that = $(this);
		var faveObj = {};
		var realfavearr = [];
		faveObj.title = rssfeedtitle;
		faveObj.link = rssfeedlink;
		faveObj.image = rssfeedimg;
		var faveArray = localStorage.getItem('faveRSS');
		//if (faveArray!= null && faveArray!="undefined") {
		var faveArr = JSON.parse(faveArray);
		var tempArray = faveArr.filter(function(fval) {return fval.link == rssfeedlink});
		//if link does not exist in array
		if (tempArray.length === 0) {
			that.css('background', 'url(img/icons/favorite-selected.png) bottom left no-repeat');
			if (faveArr.length > 5) {	faveArr.pop();}
			faveArr.unshift(faveObj);
			localStorage.setItem('faveRSS', JSON.stringify(faveArr));
		} else {
			var filtered = faveArr.filter(function(el) { return el.link != rssfeedlink; });
			that.css('background', 'url(img/icons/favorite.png) bottom left no-repeat');
			localStorage.setItem('faveRSS', JSON.stringify(filtered));
		}
	});

	//delete favorite object from array
	$('.deleteicon').live('click', function(ev) {
		var dellink = $(this).parent().find('a').attr('href');
		var faveArray = localStorage.getItem('faveRSS');
		faveArray = JSON.parse(faveArray);
		var filtered = faveArray.filter(function(el) { return el.link != dellink; });
		localStorage.setItem('faveRSS', JSON.stringify(filtered));
		if (filtered.length === 0) {
			$('#favebody').empty();
		} else {
			loadFaveRSS();
		}
	});
});