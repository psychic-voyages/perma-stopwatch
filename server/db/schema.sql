\c perma_stopwatch;

DROP TABLE IF EXISTS timer_pause;
DROP TABLE IF EXISTS timers;

CREATE TABLE timers (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    "startTime" TIMESTAMP NOT NULL DEFAULT NOW(),
    "paused" BOOLEAN DEFAULT FALSE
);

CREATE TABLE timer_pause (
    id SERIAL PRIMARY KEY,
    "tsId" INTEGER REFERENCES timers(id) ON DELETE CASCADE,
    "pauseStart" TIMESTAMP NOT NULL,
    "pauseEnd" TIMESTAMP DEFAULT NULL
);