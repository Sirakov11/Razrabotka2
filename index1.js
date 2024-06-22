const sql = require('mssql');

module.exports = async function (context, req) {
    const { title, opinion, rating, date, author } = req.body;

    if (!title || !opinion || !rating || !date || !author) {
        context.res = {
            status: 400,
            body: "Missing one or more required parameters"
        };
        return;
    }

    try {
        const pool = await sql.connect(process.env['AzureWebJobsStorage']);
        await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Opinion', sql.NVarChar, opinion)
            .input('Rating', sql.Int, rating)
            .input('Date', sql.DateTime, new Date(date))
            .input('Author', sql.NVarChar, author)
            .query('INSERT INTO Reviews (Title, Opinion, Rating, Date, Author) VALUES (@Title, @Opinion, @Rating, @Date, @Author)');

        context.res = {
            status: 200,
            body: `Review for movie '${title}' added successfully`
        };
    } catch (err) {
        context.log.error('Error inserting review: ', err);
        context.res = {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};
