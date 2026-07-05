import express from "express";
import db from "../db/client.js";
import { makeSQLTemplate } from "../utils.js"

const apiRouter = express.Router();
export default apiRouter;

apiRouter.get("/health", (req, res) => {
    res.send({message: "We up."});
})

apiRouter.get("/stopwatch", async (req, res, next) => {
    try {
        const { rows: timestamps } = await db.query(`
            SELECT * FROM timers;    
        `);
        const { rows: pauseStamps } = await db.query(`
            SELECT * FROM timer_pause;
        `);

        for (const ts of timestamps) {
            ts.pauseStamps = pauseStamps.filter(ps=>{
                return ps.tsId===ts.id
            });
        }

        res.send({timestamps});
    } catch (err) {
        next(err);
    }
});

apiRouter.post("/stopwatch", async (req, res, next) => {
    if (!req.body.name) next({message: "You must give a name to your stopwatch."});
    try {
        const fields = makeSQLTemplate(req.body);
        const { rows: [timestamp] } = await db.query(`
            INSERT INTO timers
            (${fields.keys})
            VALUES
            (${fields.temps})
            RETURNING *;
        `, fields.values);
        res.send({timestamp});
    } catch (err) {
        next(err);
    }
});

apiRouter.patch("/stopwatch/:id/pause", async (req, res, next) => {
    const { id } = req.params;
    const { timestamp } = req.body;
    
    try {
        const { rows: [pauseStamp] } = await db.query(`
            SELECT * FROM timer_pause
            WHERE "tsId"=$1 AND "pauseEnd" IS NULL;
        `, [id]);
    
        if (!pauseStamp) {
            await db.query(`
                INSERT INTO timer_pause
                ("tsId", "pauseStart")
                VALUES ($1, $2);
            `, [id, timestamp]);

            await db.query(`
                UPDATE timers
                SET "paused"=TRUE,
                "currentPause"=$1
                WHERE id=$2;
            `, [timestamp, id]);
        } else {
            const { rows: [timer] } = await db.query(`
                SELECT "totalPause" FROM timers
                WHERE id=$1;
            `, [id]);
            
            const pauseStart = new Date(pauseStamp.pauseStart).getTime();
            const pauseEnd = new Date(timestamp).getTime();
            const pauseDiff = +timer.totalPause+(pauseEnd-pauseStart);

            await db.query(`
                UPDATE timer_pause
                SET "pauseEnd"=$1
                WHERE id=$2;
            `, [timestamp, pauseStamp.id]);
            await db.query(`
                UPDATE timers
                SET "paused"=FALSE,
                "currentPause"=NULL,
                "totalPause"=$1
                WHERE id=$2;
            `, [pauseDiff, id]);
        }
        
        res.send({success: true});
    } catch (err) {
        next(err);
    }
})

// apiRouter.patch("/stopwatch/:id/pause", async (req, res, next) => {
//     const { id } = req.params;
//     const { timestamp } = req.body;
    
//     try {
//         const { rows: [pauseStamp] } = await db.query(`
//             SELECT * FROM timer_pause
//             WHERE "tsId"=$1 AND "pauseEnd" IS NULL;
//         `, [id]);
    
//         if (!pauseStamp) {
//             await db.query(`
//                 INSERT INTO timer_pause
//                 ("tsId", "pauseStart")
//                 VALUES ($1, $2);
//             `, [id, timestamp]);

//             await db.query(`
//                 UPDATE timers
//                 SET "paused"=TRUE
//                 WHERE id=$1;
//             `, [id]);
//         } else {
//             await db.query(`
//                 UPDATE timer_pause
//                 SET "pauseEnd"=$1
//                 WHERE "tsId"=$2 AND "pauseEnd" IS NULL;
//             `, [timestamp, id]);
//             await db.query(`
//                 UPDATE timers
//                 SET "paused"=FALSE
//                 WHERE id=$1;
//             `, [id]);
//         }
        
//         res.send({success: true});
//     } catch (err) {
//         next(err);
//     }
// })

apiRouter.delete("/stopwatch/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        await db.query(`
            DELETE FROM timers
            WHERE id=$1;
        `, [id]);

        res.send({success:true});
    } catch (err) {
        next(err);
    }
})