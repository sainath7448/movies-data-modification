const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http;//localhost:3000/");
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

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT
          movie_name
        FROM 
          movie;`;
  const movieNames = await db.all(getMoviesQuery);
  response.send(
    movieNames.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const addMovieQuery = `
        INSERT INTO 
              movie (director_id,movie_name,lead_actor)
        VALUES (
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );`;
  const movie = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT
          *
        FROM 
          movie
        WHERE 
            movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
       UPDATE
          movie
       SET
         director_id = '${directorId}',
         movie_name = '${movieName}',
         lead_actor = '${leadActor}'
       WHERE 
         movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
       DELETE FROM 
          movie
       WHERE 
          movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
       SELECT
         director_id,
         director_name
       FROM 
         director;`;
  const director = await db.all(getDirectorQuery);
  response.send(
    director.map((eachName) => convertDbObjectToResponseObject2(eachName))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
        SELECT
          movie_name
        FROM 
          movie
        WHERE 
          director_id = ${directorId};`;
  const movies = await db.all(getMoviesQuery);
  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
