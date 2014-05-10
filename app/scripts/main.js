'use strict';

/*global page:true */
/*global photoSize:true */
/*global apiKey:true */
/*global userId:true */
/*global perPage:true */
/*global totalPages:true */
/*global SunCalc:true */

/**
 * grabs parameters for one photo and contructs the URL for that photo
 * @param   {integer} farmId
 * @param   {string}  serverId
 * @param   {string}  Id
 * @param   {string}  secret
 * @returns {string}  url for that photo
 */
var constructPhotoUrl = function (farmId, serverId, Id, secret) {
    var photoUrl = 'http://farm' + farmId + '.staticflickr.com/' + serverId + '/' + Id + '_' + secret + '_' + photoSize + '.jpg';

    return photoUrl;
};


/**
 * loads a set of photos from flickr
 * @param {integer} page
 */
var loadPhotos = function (page) {
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&user_id=' + userId + '&per_page=' + perPage + '&page=' + page + '&format=json&nojsoncallback=1&sort=date-taken-asc', function(data) {
        var photos = data.photos.photo;

        // store the total number of pages depending on how many photos we load per page
        totalPages = data.photos.pages;

        // loop through received photos, construct URL and add image elements to dom
        $.each(photos, function () {
            var photoUrl = constructPhotoUrl(this.farm, this.server, this.id, this.secret),
                animationTime = 25 + (Math.random() * 5),
                yOffSet = (Math.random() * 8) - 4;

            var photoWrapper = $('<li/>', {
                class: 'photo',
                style: 'background-image: url("' + photoUrl + '"); -webkit-transition-duration: ' + animationTime + 's; margin-top: ' + yOffSet + '%;'
            }).appendTo('#river');

            // if the photo has a title add that too
            if (this.title !== '') {
                var titleWrapper = $('<div class="title"><span>' + this.title + '</span></div>').appendTo(photoWrapper);

                if (yOffSet > 0) {
                    titleWrapper.addClass('top');
                } else {
                    titleWrapper.addClass('bottom');
                }
            }
        });
    });
};

/**
 * Ran is the god of the sea in viking mythology
 * @return {void} A god does not return things!
 */
var summonRan = function () {
    var photosLoaded = $('.photo').length,
        currentTime = new Date(),
        sunCalc = SunCalc.getTimes(/*Date*/ currentTime, /*Number*/ 52.5234051, /*Number*/ 13.4113999);

    // load more photos if we deleted to many of them after animating
    if (photosLoaded < 5 ) {
        if (totalPages) {
            loadPhotos(page);
        } else {
            loadPhotos(page % totalPages);
        }

        page += 1;
    }

    // get the first photo that is not already animating and send it on it's way
    if (photosLoaded > 0) {
        var photoToAnimate = $('.photo:not(.animating)').filter(':first');

        photoToAnimate
            .addClass('animating')
            // add event listener to delete the image as soon as it's done animating
            .on('webkitTransitionEnd', function () { $(this).remove(); });
    }

    console.log(sunCalc);

    // watch out for sunset and dawn
    if (currentTime < sunCalc.sunrise) {
        $('body').removeClass();
        $('body').addClass('night');
    } else if (currentTime < sunCalc.sunriseEnd) {
        $('body').removeClass();
        $('body').addClass('sunrise');
    } else if (currentTime < sunCalc.sunsetStart) {
        $('body').removeClass();
        $('body').addClass('day');
    } else {
        $('body').removeClass();
        $('body').addClass('sunset');
    }

    console.log(currentTime);
    console.log(sunCalc.sunset);

    // make Ran return to check on his villagers
    window.setTimeout(summonRan, 10000);
};

// summon Ran for the first time
summonRan();

