const sql = require('mssql');

module.exports = async function (context, req) {
    const title = req.query.title;

    try {
        const pool = await sql.connect(process.env['AzureWebJobsStorage']);
        let result;

        if (title) {
            result = await pool.request()
                .input('Title', sql.NVarChar, title)
                .query('SELECT m.Title, m.Year, m.Genre, m.Description, m.Director, m.Actors, m.AverageRating, r.Opinion, r.Rating, r.Date, r.Author FROM Movies m LEFT JOIN Reviews r ON m.Title = r.Title WHERE m.Title = @Title');
        } else {
            result = await pool.request()
                .query('SELECT m.Title, m.Year, m.Genre, m.Description, m.Director, m.Actors, m.AverageRating, r.Opinion, r.Rating, r.Date, r.Author FROM Movies m LEFT JOIN Reviews r ON m.Title = r.Title');
        }

        const movies = {};
        for (let row of result.recordset) {
            if (!movies[row.Title]) {
                movies[row.Title] = {
                    Title: row.Title,
                    Year: row.Year,
                    Genre: row.Genre,
                    Description: row.Description,
                    Director: row.Director,
                    Actors: row.Actors,
                    AverageRating: row.AverageRating,
                    Reviews: []
                };
            }
            movies[row.Title].Reviews.push({
                Opinion: row.Opinion,
                Rating: row.Rating,
                Date: row.Date,
                Author: row.Author
            });
        }

        context.res = {
            status: 200,
            body: Object.values(movies)
        };
    } catch (err) {
        context.log.error('Error querying movies: ', err);
        context.res = {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};
