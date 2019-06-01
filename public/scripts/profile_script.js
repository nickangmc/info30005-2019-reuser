const listingURL = "/listing";
const viewListingURL ="/view-listing"
const userURL = "/user";
const reviewURL = "/review";
const profileURL = "/profile";

const img300URL = "http://reuser-api.s3-website-ap-southeast-1.amazonaws.com/300xAUTO/";
const img650URL = "http://reuser-api.s3-website-ap-southeast-1.amazonaws.com/650xAUTO/";

const userId = window.location.search.split("id=")[1];

// user elements
const userName = document.getElementById('full-name');
const userPic = document.getElementById('user-pic');
const userAddress = document.getElementById('user-address');
const dateJoined = document.getElementById('date-joined');
const averageRating = document.getElementById('average-rating');
const thanksRec = document.getElementById('thanks');
const contact = document.getElementById('contact');

// reviews element
const reviewsRec = document.getElementById('reviews-rec');

// listings element
const activeListings = document.getElementById('active-listings');

var user;
var reviews;
var listings;

getUser(userId).then(function(){
  // get user data
  userName.innerText = user.name;

  // name
  if (user.formattedAddress) {
    userAddress.innerHTML = "<div class =\"user-address\">" + user.formattedAddress + "</div>";
  } else {
    userAddress.innerHTML = "<div class =\"user-address\">No address listed.</div>"
  }

  // date
  var joinedDate = new Date(user.dateJoined);
  dateJoined.innerHTML = "<div class=\"date\">Joined: " +
    joinedDate.toLocaleDateString("en-AU", {year:"numeric", month:"short"}) + "</div>";

  // rating
  averageRating.innerHTML =
    "<img class=\"user-rating\" src=\"" + getStars(user.starRatingAvg) + "\">";

  // thanks received TODO 
  thanksRec.innerHTML =
    "<div>" + "10" + "<img src=\"images/profile/like.png\"><\div>";

  // profile picture  
  if (user.profilePicURL){
    userPic.innerHTML = "<img src=\"" + img300URL + user.profilePicURL + "\" class=\"profile-pic\">";
  } else {
    userPic.innerHTML = "<img src=\"images/profile/avatar-sm.png\" class=\"profile-pic\">";
  }

  // add email link to button
  const contactButton = document.getElementById("contact-button");
  contactButton.addEventListener("click", function(){
    window.location.href = "mailto:" + user.email;
  });

  // get all reviews about user
  getReviews(userId).then(function(){
    if (reviews === undefined || reviews.length == 0) {
      reviewsRec.innerHTML = "<div id=\"reviews-title\"><h4>Reviews Received</h4><div>" +
      "<p>User has not received any reivews yet.</p>";
    } else {
      getReviewers().then(function(){
        var reviews_content = "<div id=\"reviews-title\"><h4>Reviews Received</h4><div>";

        // gets the first 5 reviews left for this user
        reviews.forEach(function(review){
          var reviewDate = new Date(review.datePosted);

          reviews_content +=
          "<div class=review>" +
            "<h6 class=\"review-title\">" + review.title + "</h6>" +
            "<img class=\"star-rating\" src=\"" + getStars(review.starRating) + "\">" +
            "<div class=\"left-by\">Left by: <a href=\"" + profileURL + "?id=" + review.reviewer._id + "\">" +
            review.reviewer.name + "</a></div>" +
            "<div class=\"date\">" +
            reviewDate.toLocaleDateString("en-AU", {year:"numeric", month:"short", day:"numeric"}) + "</div>" +
            "<div class=\"review-content\">" + review.content + "</div>" +
          "</div>";
        });

        reviewsRec.innerHTML = reviews_content;
      });
    }
  });

  // get all listings made by user
  getListings(userId).then(function(){
    if (listings === undefined || listings.length == 0) {
      activeListings.innerHTML = "<div id=\"listings-title\"><h4>Active Listings</h4><div>" +
      "<p>No active listings.</p>";
    } else {
      var listings_content = "<div id=\"listings-title\"><h4>Active Listings</h4><div>";

      listings.forEach(function(listing){
        var postedDate = new Date(listing.datePosted);
        var thisListingURL = viewListingURL + "?id=" + listing._id;

        listings_content += "<div class=listing>";

        listings_content +=  "<h6 class=\"listing-title\"><a href=\"" + thisListingURL + "\">" + listing.title + "</a></h6>" +
          "<div class=\"date\">Posted: " +
          postedDate.toLocaleDateString("en-AU", {year:"numeric", month:"short",
          day:"numeric"}) + " in <i class=\"category\">" + listing.category + "</i></div>"

        // listings_content += "<p class=\"description\">" + listing.description + "</p>"

        if (listing.imageURLs.length != 0){
          listings_content += "<a href=\"" + thisListingURL + "\"><img src=\"" +
            img650URL + listing.imageURLs[0] + "\" class=\"listing-pic\"></a>";
        } else {
          listings_content += "<a href=\"" + thisListingURL +
            "\"><img src=\"images/listing/listing-no-pic.png\" class=\"listing-pic\"></a>";
        }

        listings_content += "</div>"
      });
      activeListings.innerHTML = listings_content;
    }
  });
});

function getUser(userId){
  return new Promise(resolve => {
    $.ajax({
      url: userURL + "/id/" + userId,
      type: 'GET',
      success: function(data){
        user = data;
        resolve();
      },
      error: function(data) {
        window.open("/error", "_self");
      }
    });
  });
}

// returns all review written about given user
function getReviews(userId){
  return new Promise(resolve => {
      jQuery.get(reviewURL + "/userId/" + userId, function(data){
        reviews = data;
        resolve();
      });
  });
}

// returns the number of likes gievn
// function getThanks(userId){
//   return new Promise(resolve =>{
//     jQuery.get()
//   })
// }

// given a review, will get the reviewer and add it to that review
function getReviewer(review){
  return new Promise(resolve => {
    jQuery.get(userURL + "/id/" + review.leftById, function(user) {
      resolve(review.reviewer = user);
    });
  });
}

// add associated user to all reviews
async function getReviewers(){
  const promises = reviews.map(getReviewer);
  await Promise.all(promises);
}

// returns all listings made by a user
function getListings(userId){
  return new Promise(resolve => {
      jQuery.get(listingURL + "/userId/" + userId, function(data){
        listings = data;
        resolve();
      });
  });
}
