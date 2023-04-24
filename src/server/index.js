const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const port = 3000
const cors = require('cors')
const { getPhotos, getRovers } = require('./services/nasa.service.js')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/photos', async (req, res) => {
    try {
        const rovers = await getRovers()
        const roverNames = rovers.map(({ name }) => name && name.toLowerCase() || '').filter(Boolean)
        const roverPromises = roverNames.map(roverName => getPhotos({ roverName }))
        const allRoverPhotos = await Promise.all(roverPromises)
        res.status(200)
        return res.send(allRoverPhotos.flat())
    } catch (err) {
        console.log(err)
        res.status(400)
        return res.send({ message: 'some error happened' })
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
