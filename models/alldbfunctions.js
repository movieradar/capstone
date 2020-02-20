const { Pool } = require('pg');
const pool = new Pool({
  host: 'database-movieradar.cw1d5b7mw14d.us-east-2.rds.amazonaws.com',
  user: 'postgres',
  database: 'postgres',
  password: 'Scu2019!',
  port: 5432
});

console.log("connected!");

var https = require('https');
var request = require('request');

/*
(async () => {
  console.log('starting async query');
  const result = await pool.query('SELECT NOW()');
  console.log('async query finished');
  console.log('starting callback query');
  pool.query('SELECT NOW()', (err, res) => {
    console.log('callback query finished')
  });
  console.log('calling end');
  await pool.end();
  console.log('pool has drained');
})()
*/

const createUser = (request, response) => {
	var userName = request.body.userName;
	var email = request.body.email;
	var password = request.body.password;
	//console.log(userName);
   pool.query('INSERT INTO public.users (user_name, user_email, user_password) VALUES ($1, $2, $3)', [userName, email, password], (error, results) => {
		if (error) {
		  console.log(error);
		  throw error;
		} else {
			console.log("yay");
			response.redirect('/signin');
		}
    //response.status(201).send(`User added with ID: ${result.insertId}`)
	});
};

/* problem for this function is we don't know the result for this query, */
const signin = (request, response) => {

	var email = request.body.email;
	var password = request.body.password;
		
	pool.query('SELECT count(*) From public.users where user_email = $1 and user_password = $2', [email, password], (error, results) => {
		if (error) {
		  console.log(error);
		  throw error;
		  response.redirect('/signin');
		} else if(results.rows[0].count != '1'){
			console.log("no this email in db or pwd not match");  
			console.log(results.rows);
			//response.redirect('/signin');
			response.send("no this email in db or pwd not match");
		} else {
			console.log("yay");
			console.log(results);
			request.session.login = true;
			request.session.user_id = results.rows[0].user_id;
			response.redirect('/homepage');
		}
    });
};

const logout = (request, response) => {
	delete request.session.login;
	delete request.session.user_id;
	
	response.redirect('/homepage');
};

function realHomePage(req, res){
	
	
		pool.query("select m.movie_id, h.genre, h.movie_title, m.poster_path from homepages h, movies m where h.movie_id = m.movie_id and genre in ('Comedy', 'Drama', 'Action') order by h.genre, h.year desc, h.wr desc;", (error, results) => {
		
			if (error) {
				console.log(error);
				throw error;
			} else {
				//console.log(results.rows);
				var rows = results.rows;
				
				//var movie_id = results.rows[0].movie_id;
				//var poster_url = results.rows[0].poster_url;
				//console.log(poster_url);
				req.session.flashVisitor = "You are now viewing as visitor, log in to see more";
				res.render("home.ejs",{rows: rows, sess: req.session});
			}
  		});
		
	
}

function tryHomePage(req, res){
		
	pool.query('SELECT * FROM movie ORDER BY RANDOM() LIMIT 1', (error, results) => {
		
		var post = [
			{title: "dear dear", author: "kimie"},
			{title: "there there", author: "kimie1"},
			{title: "This is the home page", author: "kimie2"}		
		];
		
		if (error) {
			console.log(error);
			throw error;
		} else {
			console.log(results.rows);
			var rows = results.rows;
			var movie_id = results.rows[0].movie_id;
			var poster_url = results.rows[0].poster_url;
			console.log(movie_id);
			req.session.movie_id = movie_id;
			res.render("trypost.ejs",{posts:post, movie_id: movie_id, poster_url: poster_url});
		}
  });
}



function trydetail(req, res){
	//console.log(req.session);
	var movieId = req.params.movieId;
	//req.session.movie_id = movieId;
	//var commentNow = ['Deadpool is a hilariously entertaining film that works mainly because of Reynolds himself. His comedic skills pay off gloriously as the titular character, who gives so many quips in one instance that some jokes will be missed.'];
	var detail_and_comment = [];

	var preaddress = "https://api.themoviedb.org/3/movie/";
	
	//var movie_id = request.params.movieId;
	var subaddress = "/videos?api_key=03eed2593faed4e618103ac16cfcaecc";
	var address = preaddress + movieId + subaddress;
	var youtube = '';
	console.log(address);
	//console.log(result);
	var trailer = [];
	https.get(address, (res) => {
	  //console.log('statusCode:', res.statusCode);
	  //console.log('headers:', res.headers);

	  res.on('data', (d) => {
	    process.stdout.write(d);
	    var preyoutube = "https://www.youtube.com/embed/";
	    console.log("key= " + JSON.parse(d));
	    var parsedData = JSON.parse(d);
	    if(typeof(parsedData['results']) !='undefined' && typeof(parsedData['results'][0]) !='undefined' && typeof(parsedData['results'][0]['key']) != 'undefined'){
	    	youtube = preyoutube + parsedData['results'][0]['key'];
	    	console.log("youtube trailer:" + youtube);
	    }
	    
	  });

	}).on('error', (e) => {
	  console.error(e);
	});

	pool.query('select m.movie_id, m.poster_path, m.vote_average, m.original_title, m.overview, m.director, m.spoken_languages, m.casting, m.runtime, m.genres from movies m where m.movie_id = $1;', [movieId],(error, results) => {
		if (error) {
			console.log(error);
			throw error;
		} else {
			//console.log(results.rows);
			//rows = results.rows;
			var title = results.rows[0].original_title;
			//console.log(results.rows[0].recommended_movie_id)
			//console.log(title);
			//req.session.kimiewant = results.rows; //not working. cannot store sth into req
			//var rating = rows[0].vote_average / 2;
			var rows = results.rows;
			//console.log("first query rows:" + rows);
			detail_and_comment.push(rows);
			pool.query('select r.recommended_movie_id, m.poster_path, m.title, m.runtime from movies m, (select recommended_movie_id from recommendations_movie where movie_id = $1) as r where r.recommended_movie_id = m.movie_id;', [movieId],(error, results) => {
				if(error){
					console.log(error);
					throw error;
				} else {
					//console.log("recommended movies:" + results.rows);
					//console.log("detail and comment:" + detail_and_comment[0]);
					var recommmendmovies = results.rows;
					detail_and_comment.push(recommmendmovies);
					//console.log(rows);
					//console.log(rows2);
					//console.log("detail and comment" + detail_and_comment);
					pool.query('select * from comments where movie_id = $1;', [movieId],(error, results) => {
						if(error){
							console.log(error);
							throw error;
						} else {
							console.log("third query this movie comments " + results.rows);
							var commentNow = results.rows;
							//detail_and_comment.push(commentNow);
							res.render("realdetail.ejs", {movieId: movieId, rows:rows, recommmendmovies:recommmendmovies, commentNow:commentNow, sess:req.session, youtube: youtube});
						}


					});
				}

			});
			
			
		}
  	});	
	//console.log(rows);
	//var rows = req.session.kimiewant;
	//console.log(req);
	console.log("this is from down function!!!!!!");
	//res.render("realdetail.ejs", {movieId: movieId, rows:rows});	
}


/*
const getMovieDetail = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM movie WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};
*/


const inputcomment = (request, response) => {
	var movieId = request.params.movieId;
	
	var userid = 1;
	
	if (typeof request.session.user_id != "undefined") {
		userid = parseInt(request.session.user_id);
	} else {
		userid = 1;
	}
	
	//console.log(request.body);
	console.log(request.session);
	var newcomment = request.body.newcomment;
	//console.log(commentNow);
	
	
	pool.query("INSERT INTO public.comments (movie_id, user_id, comment) VALUES ($1, $2, $3);",[movieId, userid, newcomment], (error, results) => {
		if (error) {
			console.log(error);
			throw error;
			response.redirect('/homepage');
		} else {
			var newaddress = "/realdetail/" + movieId;
			response.redirect(newaddress);
			//response.render("realdetail.ejs", {movieId: movieId, rows: rows, commentNow:commentNow});
			
		}
  	});	
	
};

/* double query examples */
const getRecommendMovies = (request, response) => {

	var movieId = 5;
	var result = [];
	pool.query('select m.movie_id, r.recommended_movie_id, m.original_title, m.overview, m.director, m.spoken_languages, m.casting, m.runtime, m.genres from recommendations_movie r, (select movie_id, original_title, overview, director, spoken_languages, casting, runtime, genres from movies where movie_id = movieId) as m where r.movie_id = m.movie_id;', (error, results) => {
		if (error) {
			console.log(error);
			throw error;
		} else {
			//console.log(results.rows);
			//rows = results.rows;
			var title = results.rows[0].original_title;
			//console.log(results.rows[0].recommended_movie_id)
			//console.log(title);
			//req.session.kimiewant = results.rows; //not working. cannot store sth into req
			result.push(results.rows);
			//this.rows = results.rows;
			//console.log(req.session.kimiewant);
			pool.query('SELECT NOW()', (error, results) => {
				if (error) {
					console.log(error);
					throw error;
			 	} else {
			 		result.push(results.rows);
			 		console.log(result);
			 		response.render("*****.ejs", {movieId: movieId, rows:result});
			 	}
				
			});
		}

			
	});
	
}

const searchMovieByKey = (req, res)=>{
	var movieId = req.params.movieId;
	//var searchkey = request.body.searchkey;
	var searchkeyString = req.body.searchkey;
	console.log(searchkeyString);
	var searchkeyArray = searchkeyString.split(' ');
	var searchkey = searchkeyArray.join('&');
	console.log("searchkey after Modification" + searchkey);
	
	pool.query("select movie_id, title, runtime, vote_average, overview, poster_path, tagline, genres, year, casting, director from movies where document_with_weight @@ to_tsquery($1) order by ts_rank(document_with_weight, to_tsquery($1)) desc;",[searchkey], (error, results) => {
		if (error) {
			console.log(error);
			throw error;
		} else {
			
			var rows = results.rows;
			//console.log(rows);
			
			res.render("realsearchresult.ejs", {movieId: movieId, rows: rows, sess:req.session});
			
		}
  	});	

}

const inputrating = (request, response) => {
	var ratingval = request.body.ratingval;
	var movieId = request.body.movieId;
	console.log("ratingval=" + ratingval);
	console.log("rating movie id=" + movieId);
	var user_id = 1;
	
	if (typeof request.session.user_id != "undefined") {
		user_id = parseInt(request.session.user_id);
	} else {
		user_id = 1;
	}
	//console.log(userName);
   pool.query('INSERT INTO public.ratings (movie_id, user_id, rating) VALUES ($1, $2, $3)', [movieId, user_id, ratingval], (error, results) => {
		if (error) {
		  console.log(error);
		  throw error;
		} else {
			console.log("yay, you input a rating!");
			var newaddress = "/realdetail/" + movieId;
			response.redirect(newaddress);
		}
    //response.status(201).send(`User added with ID: ${result.insertId}`)
	});
};

const tryPassFunction = (request, response) => {
	
   
	console.log("yay! Kimie!");
}

const tryGetTrailer = (req, response) => {
	var preaddress = "https://api.themoviedb.org/3/movie/";
	var movie_id = 5;
	//var movie_id = request.params.movieId;
	var subaddress = "/videos?api_key=03eed2593faed4e618103ac16cfcaecc";
	var address = preaddress + movie_id + subaddress;
	var result = [];
	console.log(address);
	//console.log(result);
	
	request(address,function(error, response, body){
		if(error){
			console.log("Something wrong");
			console.log(error);
		}
		else if (!error && response.statusCode === 200) {
        	var data = JSON.parse(body);
        	if(typeof data['results'][0]['key']!= undefined){
        		var subfix = data['results'][0]['key'];
        		
        	} 
        	

    	}
	});

	/*
	fetch(request)
	  .then(response => {
	    if (response.status === 200) {
	      return response.json();
	    } else {
	      throw new Error('Something went wrong on api server!');
	    }
	  })
	  .then(response => {
	    console.debug(response);
	    // ...
	  }).catch(error => {
	    console.error(error);
	  });
	 */
	/*
	https.get(address, (res) => {
	  console.log('statusCode:', res.statusCode);
	  console.log('headers:', res.headers);

	  res.on('data', (d) => {
	    process.stdout.write(d);
	    console.log("\n-----------\n");
	    var preyoutube = "https://www.youtube.com/embed/";
	    //console.log("\n This is d: \n" + d);
	    console.log(JSON.parse(d).explanation);
	    //var jsonfile = res;
	    //console.log(jsonfile);
	    //var youtube = preyoutube + d[0].key;
	    result.push(d);
	    console.log(result[0]);
	  });

	}).on('error', (e) => {
	  console.error(e);
	});
	*/
	/*
	https.get(address, (resp) => {
		  
		  let data = '';
		  console.log("data now is " + data);
		  // A chunk of data has been recieved.
		  resp.on('data', (chunk) => {
		    data += chunk;
		  });

		  // The whole response has been received. Print out the result.
		  resp.on('end', () => {
		    console.log(JSON.parse(data).explanation);
		  });

	}).on("error", (err) => {
			console.log("Error: " + err.message);
		  });
	response.render()
	*/
}




module.exports = {
  createUser,
  signin,
	trydetail,
	tryHomePage,
	realHomePage,
	logout,
	inputcomment,
	getRecommendMovies,
	searchMovieByKey,
	tryPassFunction,
	inputrating,
	tryGetTrailer
}

//pool.end().then(() => console.log('pool has ended'))