require('dotenv').config()
const request = require('request')


const raiseError = (message) => { throw Error(message) }

const getRequiredEnvVars = (({
    hostName = raiseError('no nasa host name was provided'),
    apiKey = raiseError('no nasa api key was provided'),
}) => ({ hostName, apiKey }))

const { hostName, apiKey } = getRequiredEnvVars({ hostName: process.env.NASA_HOST_NAME, apiKey: process.env.NASA_API_KEY })

const getPhotos = ({ hostName, apiKey }) => ({ roverName }) => {
    const options = {
        'method': 'GET',
        'url': `https://${hostName}/mars-photos/api/v1/rovers/${roverName}/photos?sol=1000&api_key=${apiKey}`,
        'headers': {
        }
    }

    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) { return reject(error) }
            const { photos = [] } = JSON.parse(response.body) || {}
            return resolve(photos)
        })
    })
}

const getRovers = ({ hostName, apiKey }) => () => {
    const options = {
        'method': 'GET',
        'url': `https://${hostName}/mars-photos/api/v1/rovers?api_key=${apiKey}`,
        'headers': {
        }
    }

    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) { return reject(error) }
            const { rovers = [] } = JSON.parse(response.body) || {}
            return resolve(rovers)
        })
    })
}

module.exports = {
    getRovers: getRovers({ hostName: process.env.NASA_HOST_NAME, apiKey: process.env.NASA_API_KEY }),
    getPhotos: getPhotos({ hostName: process.env.NASA_HOST_NAME, apiKey: process.env.NASA_API_KEY }),
}
