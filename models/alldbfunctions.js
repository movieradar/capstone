const { Pool } = require('pg');
const pool = new Pool({
  host: 'database-movieradar.cw1d5b7mw14d.us-east-2.rds.amazonaws.com',
  user: 'postgres',
  database: 'postgres',
  password: 'Scu2019!',
  port: 5432
});

console.log("connected!");

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
   pool.query('INSERT INTO public.user (user_name, user_email, user_password) VALUES ($1, $2, $3)', [userName, email, password], (error, results) => {
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
		
	pool.query('SELECT count(*) From public.user where user_email = $1 and user_password = $2', [email, password], (error, results) => {
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
			response.redirect('/homepage');
		}
    });
};

const logout = (request, response) => {
	delete request.session.login;
	
	response.redirect('/homepage');
};

function realHomePage(req, res){
	
	
		pool.query("select m.movie_id, h.genre, h.movie_title, m.poster_path from homepages h, movies m where h.movie_id = m.movie_id and genre in ('Comedy', 'Drama', 'Action') order by h.genre, h.year desc, h.wr desc;", (error, results) => {
		
			if (error) {
				console.log(error);
				throw error;
			} else {
				console.log(results.rows);
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
			res.render("trypost.ejs",{posts:post, movie_id: movie_id, poster_url: poster_url});
		}
  });
}



function trydetail(req, res){
	//console.log(req.session);
	var movieId = req.params.movieId;
	var commentNow = ['Deadpool is a hilariously entertaining film that works mainly because of Reynolds himself. His comedic skills pay off gloriously as the titular character, who gives so many quips in one instance that some jokes will be missed.'];
	
	pool.query('select m.movie_id, r.recommended_movie_id, m.original_title, m.overview, m.director, m.spoken_languages, m.casting, m.runtime, m.genres from recommendations_movie r, (select movie_id, original_title, overview, director, spoken_languages, casting, runtime, genres from movies where movie_id = $1) as m where r.movie_id = m.movie_id;', [movieId],(error, results) => {
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
			var rows = results.rows;
			//this.rows = results.rows;
			//console.log(req.session.kimiewant);
			//commentNow = ['Deadpool is a hilariously entertaining film that works mainly because of Reynolds himself. His comedic skills pay off gloriously as the titular character, who gives so many quips in one instance that some jokes will be missed.'];
			res.render("realdetail.ejs", {movieId: movieId, rows:rows, commentNow:commentNow});
			
		}
  	});	
	//console.log(rows);
	//var rows = req.session.kimiewant;
	//console.log(req);
	console.log("this is from down function!!!!!!");
	//res.render("realdetail.ejs", {movieId: movieId, rows:rows});	
}



const getMovieDetail = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM movie WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};



const inputcomment = (request, response) => {
	var movieId = request.params.movieId;
	var rows = request.body.rows;
	var commentNow = [request.body.commentNow];
	console.log(commentNow);
	console.log(request.body);
	var comment = request.body.newcomment;
	//console.log(commentNow);
	
	//var commentNow = ['Deadpool is a hilariously entertaining film that works mainly because of Reynolds himself. His comedic skills pay off gloriously as the titular character, who gives so many quips in one instance that some jokes will be missed.'];
	//commentNow[commentNow.length] = comment;
	commentNow[commentNow.length] = comment;
	
	
	pool.query('select m.movie_id, r.recommended_movie_id, m.original_title, m.overview, m.director, m.spoken_languages, m.casting, m.runtime, m.genres from recommendations_movie r, (select movie_id, original_title, overview, director, spoken_languages, casting, runtime, genres from movies where movie_id = 5) as m where r.movie_id = m.movie_id;', (error, results) => {
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
			var rows = results.rows;
			//this.rows = results.rows;
			//console.log(req.session.kimiewant);
			
			
			response.render("realdetail.ejs", {movieId: movieId, rows: rows, commentNow:commentNow});
			
		}
  	});	
	
	
	
	//response.render("realdetail.ejs", {movieId: movieId, rows: rows, commentNow:commentNow});
};


const getRecommendMovies = (request, response) => {

	var movieId = 5;
	var result = [];
	pool.query('select m.movie_id, r.recommended_movie_id, m.original_title, m.overview, m.director, m.spoken_languages, m.casting, m.runtime, m.genres from recommendations_movie r, (select movie_id, original_title, overview, director, spoken_languages, casting, runtime, genres from movies where movie_id = 5) as m where r.movie_id = m.movie_id;', (error, results) => {
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
			 		response.render("doubleQuery.ejs", {movieId: movieId, rows:result});
			 	}
				
			});
		}

			
	});
	
}

const searchMovieByKey = (req, res)=>{
	var movieId = request.params.movieId;
	var searchkey = request.body.searchkey;
	
	
	pool.query("select movie_id, title, overview, tagline, genres, casting, director from movies where document_with_weight @@ to_tsquery($1) order by ts_rank(document_with_weight, o_tsquery($1)) desc;",[searchkey], (error, results) => {
		if (error) {
			console.log(error);
			throw error;
		} else {
			
			var rows = results.rows;
			console.log(rows);
			
			response.render("realsearchresult.ejs", {movieId: movieId, rows: rows, sess:req.session});
			
		}
  	});	

}





/* https://node-postgres.com/api/result, can solve the problem stated above in const signin, but cannot catch error 
const { Pool } = require('pg')
const pool = new Pool()
const client = await pool.connect()
const result = await client.query({
  rowMode: 'array',
  text: 'SELECT 1 as one, 2 as two;',
})
console.log(result.fields[0].name) // one
console.log(result.fields[1].name) // two
console.log(result.rows) // [1, 2]
await client.end()
*/
	
/* follow is a varian for query*/
// 	const query = {
// 	  text: 'SELECT count(*) From public.user where user_email = $1 and user_password = $2',
// 	  values: [email, password],
// 	}
// 	// callback
// 	client.query(query, (err, response) => {
// 	  if (err) {
// 		console.log(err.stack);
// 	  } else {
// 		console.log(response.rows[0]);
// 		 response.redirect('/');
// 	  }
// 	})
// 	// promise
// 	client
// 	  .query(query)
// 	  .then(response => console.log(res.rows[0]))
// 	  .catch(e => console.error(e.stack))
// };


/* can be deleted after all is done
const createUser = (request, response) => {
	const userName = request.body.userName;
	const email = request.body.email;
	const password = request.body.password;
	console.log('got to post page');
  //const { userName, email, password } = request.body
  pool.query('INSERT INTO public.user (user_name, user_email, user_password) VALUES ($1, $2, $3)', [userName, email, password], (error, results) => {
    if (error) {
      console.log(error);
      return console.error('Error executing query', error.stack);
    }
    //response.status(201).send(`User added with ID: ${result.insertId}`)
    return console.log('successful!');
  });
};
*/

module.exports = {
  createUser,
  getMovieDetail,
  signin,
	trydetail,
	tryHomePage,
	realHomePage,
	logout,
	inputcomment,
	getRecommendMovies,
	searchMovieByKey
}

//pool.end().then(() => console.log('pool has ended'))