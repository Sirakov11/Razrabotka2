const sql = require('mssql');

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();
    context.log('Timer trigger function ran!', timeStamp);

    try {
        const pool = await sql.connect(process.env['AzureWebJobsStorage']);
        const result = await pool.request().query('SELECT Title, AVG(Rating) as AvgRating FROM Reviews GROUP BY Title');

        for (let row of result.recordset) {
            await pool.request()
                .input('AvgRating', sql.Float, row.AvgRating)
                .input('Title', sql.NVarChar, row.Title)
                .query('UPDATE Movies SET AverageRating = @AvgRating WHERE Title = @Title');
        }
    } catch (err) {
        context.log.error('Error calculating average ratings: ', err);
    }
};
