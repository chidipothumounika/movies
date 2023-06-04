const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
    return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor,

    };
};

const coverMovieDbObject = (dbObject) =>{
    return{
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
    };
};

app.get("/movies/",async(request,response)=>{
    const getBooksQuery = `
    SELECT
      movie_name
    FROM
      movies;`
    const booksArray = await db.all(getBooksQuery);
    response.send(
          booksArray.map((eachPlayer) =>
          ({movieName:eachPlayer.movie_name})
      
    );
});

app.post("/movies/",async(request,response)=>{
  const bookDetails = request.body;
  const {
    directorId,
    movieName,
    leadActor,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (director_id,movie_name,lead_actor)
    VALUES
      (
         ${directorId},
         '${movieName}',
         '${leadActor}',
      );`;

  await db.run(addBookQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/",async(request,response)=>{
    const  { movieId } = request.params;
    const getBookQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getBookQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId/",async(request,response)=>{
    const { movieId } = request.params;
  const bookDetails = request.body;
  const {
    directorId,
    movieName,
    leadActor,
  } = bookDetails;

    const updateBookQuery = `
       UPDATE
          movie
       SET
         director_Id=${directorId},
         movie_name='${movieName}',
         lead_actor='${leadActor}'
       WHERE
          movie_id = ${movieId};`;
  await db.run(updateBookQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteBookQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      director;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(
      booksArray.map((eachDirector)=>
      coverMovieDbObject(eachDirector))
  );
});

app.get("/directors/:directorId/movies/",async(request,response)=>{
    const{directorId} = request.params;
    const getQuery = `
      SELECT 
        movie_name
      FROM 
        movie
      WHERE 
        director_id = '${directorId}';`;
   const movieArray = await db.all(getQuery);
   response.send(
       movieArray.map((eachMovie)=> ({movieName:eachMovie.movie_name}))
   );
});

module.exports = app;
