const allowedOrigins = [
    "https://e-learning-website-five-alpha.vercel.app",
    "https://e-learning-website-git-main-dinesh-976d.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked for origin: ${origin}`)
            );
        },
        credentials: true,
    })
);