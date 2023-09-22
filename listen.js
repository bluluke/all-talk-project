const {app} = require("./app")
const { PORT = 9020} = process.env;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)    
})