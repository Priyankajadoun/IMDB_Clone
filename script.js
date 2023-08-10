var title = ''; // Declare a variable to store the value
var responseJSON;
var favoritesArray = [];
var favMoviePageData = [];
var searchArr = [];
var likedMovies = [];
var ht = window.innerHeight - 45.5;
var viewportHeight = $('footer').css('top', ht + 'px');
var movieData = []; // Initialize movieData as an empty array
var searchedResult=[];


$('#go-detailspage').click(function(){
  searchedResult = JSON.parse(localStorage.getItem('searchedResult')) || [];
  searchedTitle = searchedResult[0].Title;
  console.log(searchedTitle)
  movieDetails(searchedTitle);
  window.location.href = 'http://127.0.0.1:5500/movie-details.html';
})



$(document).ready(function() {

  // handle the searc button by keypress(enter)
  $("#search-input").on("keypress", function (event) {
    if (event.keyCode === 13) {
      // Prevent form submission
      event.preventDefault();
  
      // Call the fetchMovie function when Enter is pressed
      fetchMovie();
    }
  });
  
 
// Hide the "Add to Favorite",' movie image ' and 'details Button' button initially
$('#add-favorite').hide();
$('#go-detailspage').hide();
$('#movie-poster').hide();

  function remove(titleToRemove) {
    console.log(titleToRemove);
    console.log(favMoviePageData);
  
    var indexToRemove = favMoviePageData.findIndex(function (movie) {
      return movie.favTitle === titleToRemove;
    });
  
    if (indexToRemove !== -1) {
      favMoviePageData.splice(indexToRemove, 1);
      console.log(favMoviePageData);
      localStorage.setItem('favMoviePageData', JSON.stringify(favMoviePageData));
  
      var favoritesIndexToRemove = favoritesArray.indexOf(titleToRemove);
      if (favoritesIndexToRemove !== -1) {
        favoritesArray.splice(favoritesIndexToRemove, 1);
        console.log(favoritesArray);
        localStorage.setItem('favoritesArray', JSON.stringify(favoritesArray));
      }
  
      // Remove the list item from the DOM
      $(event.target).closest('li').remove();
    }
  }
  
  $(document).on('click', '.remove-button',function(){
    var titleToRemove = $(this).prev().text().trim();
    console.log(titleToRemove)
    remove(titleToRemove);
   
  });
  
    movieData = JSON.parse(localStorage.getItem('movieData')) || [];
    console.log(movieData)
    // Function to update the movie details on the page
    function updateMovieDetails(data) {
      $('#movieDetails-title').text(data.Title);
      $('#movieDetails-poster').attr('src', data.Poster);
      $('#movieDetails-plot').text("Description : " + data.Plot);
      $('#movieDetails-year').text("Year : " + data.Year);
      $('#movieDetails-director').text("Director : " + data.Director);
      $('#movieDetails-actors').text("Actors : " + data.Actors);
      $('#movieDetails-writer').text("Writer : " + data.Writer);
      $('#movieDetails-date').text("Released Date : " + data.Released);
      $('#movieDetails-genre').text("Genre : " + data.Genre);
      $('#movieDetails-lang').text("Language : " + data.Language);
      $('#movieDetails-countary').text("Country : " + data.Country);
    }
  
    if (movieData.length > 0) {
      // If movieData is already available in local storage, update the details
      updateMovieDetails(movieData[0]);
    }
  
  
    $("#search-input").on("keyup", function (e) {
      // First, clear previous search results
      clearSearchResults();
      // Then, fetch the movie details and update the page when resolved
      movieDetails(e.target.value)
        .then(function (data) {
          updateMovieDetails(data);
        })
        .catch(function (error) {
          console.error(error);
        });
    });
  


  
  // Retrieve the favorite movies from local storage
  favMoviePageData = JSON.parse(localStorage.getItem('favMoviePageData')) || [];
  console.log(favMoviePageData)
  // Display the favorite movies on the page
  var ulFavPage = $('#favorite-movies-fav-page');
  for (var i = 0; i < favMoviePageData.length; i ++) {
    const obj = favMoviePageData[i];
  const favTitle = obj.favTitle;
  const favURL = obj.favURL;
   
    var newLiFavPage = $('<li>',{
      class:"favList"
    });
    var imgFavPage = $('<img>', {
      src: favURL,
      class: 'img'
    });
    var removeBtnFavPage = $('<button>', {
      text: 'Remove',
      class: 'remove-button'
    });
    var Title = $('<div>',{
      text : favTitle
    })
    newLiFavPage.append(imgFavPage);
    newLiFavPage.append(Title);
    newLiFavPage.append(removeBtnFavPage);
    ulFavPage.append(newLiFavPage);
  }
});


function clearSearchResults() {
  $('#movie-search').empty();
}

// Like a movie
function likeMovie(movie) {
  if (!likedMovies.includes(movie)) {
    likedMovies.push(movie);
    // Save the updated likedMovies array to local storage
    localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
  }
}

// Unlike a movie
function unlikeMovie(movie) {
  const index = likedMovies.indexOf(movie);
  if (index !== -1) {
    likedMovies.splice(index, 1);
    // Save the updated likedMovies array to local storage
    localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
  }
}


// Retrieve liked movies from local storage on page load
likedMovies = JSON.parse(localStorage.getItem('likedMovies')) || [];




function movieDetails(titleName) {
  console.log(titleName)
  return new Promise(function(resolve, reject) {
    var Request = new XMLHttpRequest();
    Request.onload = function() {
      responseJSON = JSON.parse(Request.response);
      localStorage.removeItem('movieData')
      movieData  = [];
      movieData.push(responseJSON);
      console.log(movieData)
      // Store the responseJSON in local storage
      localStorage.setItem('movieData', JSON.stringify(movieData));
      resolve(responseJSON); // Resolve the Promise with the responseJSON
    };

    Request.onerror = function() {
      reject(new Error('Failed to fetch movie details.'));
    };

    Request.open(
      'get',
      `http://www.omdbapi.com/?i=tt3896198&apikey=fc60a832&t=${titleName}`,
      true
    );
    Request.send();
  });
}


// search result 
function searchResult(e){
  clearSearchResults(); // Clear previous search results
   // Clear the previous error message
   $('#notFound').text('');
  var Req = new XMLHttpRequest();
  Req.onload = function(){
  // console.log(Req.response);
  resJSON = JSON.parse(Req.response);
  console.log(resJSON);

   // Check if the movie is not already in the searchArr (by checking the title)
   var isUnique = searchArr.every(function (movie) {
    return movie.Title !== resJSON.Title;
  });

  if (isUnique) {
    // Add the result to the searchArr
    searchArr.push(resJSON);
  }
  console.log(searchArr);
  // Clear previous search results
  clearSearchResults();
  
  
    // Get the value on keydown event
    title = e.target.value;
    console.log(title);
    var searchUl = $('#movie-search');

  
    searchArr.forEach(function (movie) {
      console.log(!movie.Error);
      if(!movie.Error){
        console.log(movie)
      var movieSearchTitle = movie.Title;
      var movieSearchImg = movie.Poster;
      var movieSearchYear = movie.Year;
      var movieSearchDirector = movie.Director;
      var movieSearchGenre = movie.Genre;
  
      var searchCard = $('<div>', {
        class: 'card cardDiv',
        style: 'width: 10rem;'
      });
  
      var image = $('<img>', {
        src: movieSearchImg,
        class: 'card-img-top img',
        alt: 'Movie Poster'
      });
  
      var cardBody = $('<div>', {
        class: 'card-body cardContent'
      });
  
      var cardTitle = $('<h5>', {
        class: 'card-title cardHeading',
        text: movieSearchTitle
      });
  
      var cardText = $('<p>', {
        class: 'card-text text',
        text: `Year: ${movieSearchYear}, Director: ${movieSearchDirector}, Genre: ${movieSearchGenre}`
      });
  
     
      var goSomewhereLink = $('<a>', {
        href: 'http://127.0.0.1:5500/movie-details.html',
        class: 'btn btn-primary cardBtn',
        text: 'Details',
        click: function(event) {
          // Prevent the default anchor behavior
          event.preventDefault();
      
          // Call the movieDetails function immediately
          movieDetails(movie.Title);
      
          // Wait for 2 seconds (2000 milliseconds) before navigating to the URL
          setTimeout(function() {
            // Replace 'window.location.href' with the URL where you want to navigate after the delay
            window.location.href = 'http://127.0.0.1:5500/movie-details.html';
          }, 2000);
        }
      });
      
      var likeButton = $('<div>', {
        html:'<i class="bi bi-heart"></i>',
        class: 'like-button',
        click: function() {
          if (!likedMovies.includes(movie) ) {
            likeMovie(movie);
            $(this).html('<i class="bi bi-heart-fill"></i>');
            addFavBtn(movie); 
          } else {
            unlikeMovie(movie);
            $(this).html('<i class="bi bi-heart"></i>');
            console.log(movie)
           var titleToRemove = movie.Title;
          
              console.log(titleToRemove);
              console.log(favMoviePageData);
            
              var indexToRemove = favMoviePageData.findIndex(function (movie) {
                return movie.favTitle === titleToRemove;
              });
            
              if (indexToRemove !== -1) {
                favMoviePageData.splice(indexToRemove, 1);
                console.log(favMoviePageData);
                localStorage.setItem('favMoviePageData', JSON.stringify(favMoviePageData));
            
                var favoritesIndexToRemove = favoritesArray.indexOf(titleToRemove);
                if (favoritesIndexToRemove !== -1) {
                  favoritesArray.splice(favoritesIndexToRemove, 1);
                  console.log(favoritesArray);
                  localStorage.setItem('favoritesArray', JSON.stringify(favoritesArray));
                }
            
                // Remove the list item from the DOM
                $(event.target).closest('li').remove();
              }
            
          }
        }
      });
       // Check if the movie is in favorites and set the heart icon accordingly
       if (isMovieInFavorites(movie.Title)) {
        likeButton.html('<i class="bi bi-heart-fill"></i>');
      }
      cardBody.append(cardTitle);
      cardBody.append(cardText);
      cardBody.append(goSomewhereLink);
      cardBody.append(likeButton);
  
      searchCard.append(image);
      searchCard.append(cardBody);
  
      var searchLi = $('<li>',{
        style: 'margin: 20px; box-shadow:rgb(137 137 136 / 40%) -5px 5px, rgb(121 121 121 / 30%) -10px 10px, rgb(109 109 108 / 20%) -15px 15px, rgb(129 129 129 / 10%) -20px 20px, rgb(101 101 100 / 8%) -25px 25px;'
      
      });
      searchLi.append(searchCard);
  
      searchUl.append(searchLi);
    }else{
      console.log(movie)
      if(movie.Response==false){
      $('#notFound').text(movie.Error)
      }
    }
    }); 
  }

  Req.open('get',`http://www.omdbapi.com/?i=tt3896198&apikey=fc60a832&t=${title}`,true);
  Req.send();

  
}



$("#search-input").on("keyup", searchResult);

// Function to check if a movie is already in favorites
function isMovieInFavorites(movieTitle) {
  // The function takes a parameter 'movieTitle', which represents the title of a movie.

  return favMoviePageData.some(function (movie) {
    // 'favMoviePageData' is an array that contains objects representing movies in the favorites list.

    return movie.favTitle === movieTitle;
    // The 'some' method is used to check if at least one element in the 'favMoviePageData' array satisfies the provided condition.

    // Here, it checks if any movie object in 'favMoviePageData' has a 'favTitle' property equal to the provided 'movieTitle'.

    // If such a movie is found, 'some' will immediately return true, indicating that the movie is already in favorites.

    // If no matching movie is found, 'some' will return false, indicating that the movie is not in favorites.
  });
}

// favorite list
function addFavBtn(movie) {
  var ul = $('#favorite-movies');

  var movieTitle = movie.Title;
  var url = movie.Poster;
  favoritesArray = JSON.parse(localStorage.getItem('favoritesArray')) || [];
  console.log(favoritesArray);
  console.log(!favoritesArray.includes(movieTitle))

  if (!isMovieInFavorites(movieTitle)) {
    favMoviePageDataObj = {
      favTitle:movieTitle,
      favURL:url
    }
    $(".toast-body").text(`${movieTitle} has added in your favorite movies `)
      favMoviePageData.push(favMoviePageDataObj);
    favoritesArray.push(movieTitle); // Add the movie title to the favorites array
       console.log(favoritesArray)
 
    var newLi = $('<li>');
    var img = $('<img>', {
      src: url,
      class: 'img'
    });
    var removeBtn = $('<button>', {
      text: 'Remove',
      class: 'remove-button'
    });

    newLi.append(img);
    newLi.append(movieTitle);
    newLi.append(removeBtn);
    ul.append(newLi);
    localStorage.setItem('favoritesArray', JSON.stringify(favoritesArray));
    localStorage.setItem('favMoviePageData', JSON.stringify(favMoviePageData));
  }else{
    $(".toast-body").text(`${movieTitle} is already added in your favorite movies `);
  }
}
$('#add-favorite').on('click', function() {
  addFavBtn(responseJSON);
});

// ajax code 

function fetchMovie(){
   
        console.log(title); // Output the stored value
        var Request = new XMLHttpRequest();
        Request.onload = function(){
        // console.log(Request.response);
        responseJSON = JSON.parse(Request.response);
        // console.log(responseJSON);
        localStorage.removeItem('searchedResult');
        searchedResult = [];
        searchedResult.push(responseJSON);
        console.log(searchedResult)
//  check if the Error property exists in any of the objects in the array
        var hasErrorProperty = false;

searchedResult.forEach(function(movie) {
  if ("Error" in movie) {
    hasErrorProperty = true;
  }
});
console.log(hasErrorProperty);
console.log(!hasErrorProperty);
if(hasErrorProperty){
  $('#notFound').text(responseJSON.Error)
}
if(!hasErrorProperty){
  $('#add-favorite').show(); // show the "Add to Favorite" button when no input
  $("#go-detailspage").show();
  $('#movie-poster').show();
  $('#movie-title').show();
  $('#movie-year').show();
  $('#movie-director').show();
  $('#movie-genre').show();

}else{

  $('#add-favorite').hide(); // Hide the "Add to Favorite" button when no input
  $("#go-detailspage").hide();
  $('#movie-poster').hide();
  $('#movie-title').hide();
  $('#movie-year').hide();
  $('#movie-director').hide();
  $('#movie-genre').hide();
}
        $('#movie-title').text(responseJSON.Title);
        $('#movie-poster').attr('src',responseJSON.Poster);
        $('#movie-plot').text(responseJSON.Plot);
        $('#movie-year').text("Relesed Year : "+ responseJSON.Year);
        $('#movie-director').text("Director : " + responseJSON.Director);
        $('#movie-genre').text("Genre : " + responseJSON.Genre);
        
        localStorage.setItem('searchedResult', JSON.stringify(searchedResult)); 
    }
    Request.open('get',`http://www.omdbapi.com/?i=tt3896198&apikey=fc60a832&t=${title}`,true);
    Request.send();
}

$('#searchBtn').click(fetchMovie);


 // Toasts
const toastTrigger = document.getElementById('add-favorite')
const toastLiveExample = document.getElementById('liveToast')

if (toastTrigger) {
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
  toastTrigger.addEventListener('click', () => {
    toastBootstrap.show()
  })
}