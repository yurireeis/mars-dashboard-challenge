// TODO: implement ImmutableJS logic to store the data
// TODO: implement loading behavior

const getImagesFromNasa = async () => {
    const requestOptions = {
        method: 'GET',
        redirect: 'follow'
    }
    const data = await fetch("http://localhost:3000/photos", requestOptions)
    const photos = await data.json()
    return { photos }
}

getPhotosCamerasAndRovers = ({ photos: foundPhotos = [] }) => {
    const photos = foundPhotos.map(({
        id,
        img_src:
        imgSrc,
        earth_date:
        earthDate,
        sol,
        rover: { id: roverId } = {},
        camera: { id: cameraId } = {}
    }) => ({ id, imgSrc, earthDate, sol, roverId, cameraId }))

    const cameras = foundPhotos.reduce((acc, { camera: { id, rover_id: roverId, full_name: fullName, name } = {}, camera }) => {
        const findCamera = acc.find(({ id: cameraId }) => id === cameraId)
        return findCamera ? acc : [...acc, { id, roverId, name, fullName }]
    }, [])

    const rovers = foundPhotos.reduce((acc, { rover: { id, landing_date: landingDate, launch_date: launchDate, status, name } = {} }) => {
        const findRover = acc.find(({ id: roverId }) => id === roverId)
        return findRover ? acc : [...acc, { id, landingDate, launchDate, status, name }]
    }, [])

    return { photos, cameras, rovers }
}

const getAllElementsAndSelectedOne = () => {
    const [activeSlide] = document.getElementsByClassName('carousel-item active') || []
    return Promise.resolve({ activeSlide })
}

const deactivateCurrent = ({ previousActiveSlide, nextActiveSlide }) => {
    if (nextActiveSlide && previousActiveSlide) { previousActiveSlide && previousActiveSlide.classList.remove("active") }
    return { previousActiveSlide, nextActiveSlide }
}

const activateNextOne = ({ activeSlide }) => {
    const { nextElementSibling: nextSlideEl } = activeSlide
    if (nextSlideEl) { nextSlideEl.classList.add("active") }
    return { previousActiveSlide: activeSlide, nextActiveSlide: nextSlideEl }
}

const activatePrevOne = ({ activeSlide }) => {
    const { previousElementSibling: prevSlideEl } = activeSlide
    if (prevSlideEl) { prevSlideEl.classList.add("active") }
    return { previousActiveSlide: activeSlide, nextActiveSlide: prevSlideEl }
}

const getElementsAdjustedByCheckboxStatuses = ({ id, checked }) => {
    const shownElementId = id.replace('display-check', 'field-shown')
    const hiddenElementId = id.replace('display-check', 'field-hidden')
    const shownEl = document.getElementById(shownElementId)
    const hiddenEl = document.getElementById(hiddenElementId)
    shownEl.style.display = checked ? 'inline' : 'none'
    hiddenEl.style.display = checked ? 'none' : 'inline'
    return [shownEl, hiddenEl]
}

const setLoadingState = ({ loaderId, goButtonId, roverSelectorId }) => ({ isLoading }) => {
    const loader = document.getElementById(loaderId)
    const button = document.getElementById(goButtonId)
    const roverSelector = document.getElementById(roverSelectorId)
    loader.style.display = isLoading ? 'block' : 'none'
    button.disabled = isLoading
    roverSelector.disabled = isLoading
    return { isLoading }
}

(() => {
    // TODO: set store using immutability
    // const store = Immutable.Map({ photos: Immutable.List(), cameras: Immutable.List(), rovers: Immutable.List() })
    const store = { photos: [], cameras: [], rovers: [] }

    const getCarouselEl = (cameras) => ({ cameraId, earthDate, imgSrc }, index) => {
        const photoElsClasses = ["carousel-item", "rover-photo-container"]
        const captionElsClasses = ["carousel-caption", "d-none", "d-md-block"]
        const { name: cameraName } = cameras.find(({ id }) => cameraId === id)
        const carouselEl = document.createElement("div")
        photoElsClasses.forEach((className) => carouselEl.classList.add(className))
        if (0 === index) { carouselEl.classList.add("active") }
        const carouselImgEl = document.createElement("img")
        carouselImgEl.src = imgSrc
        carouselImgEl.classList = ["rover-photo-img"]
        carouselEl.appendChild(carouselImgEl)
        const carouselCaptionEl = document.createElement("div")
        captionElsClasses.forEach(className => carouselCaptionEl.classList.add(className))
        const carouselCaptionCameraEl = document.createElement("h5")
        carouselCaptionCameraEl.innerText = `FROM: ${cameraName}`
        const carouselCaptionEarthDateEl = document.createElement("p")
        carouselCaptionEarthDateEl.innerText = `EARTH DATE: ${earthDate}`
        carouselCaptionEl.appendChild(carouselCaptionCameraEl)
        carouselCaptionEl.appendChild(carouselCaptionEarthDateEl)
        carouselEl.appendChild(carouselCaptionEl)
        return carouselEl
    }

    const selectRoverEl = document.getElementById('select-rover')
    const nextSlideButton = document.getElementById('carousel-control-next-button')
    const displayInfoCheckEls = document.getElementsByClassName('display-info-check')

    Array.from(displayInfoCheckEls).forEach((el) => el.addEventListener('click', (ev) => {
        const { currentTarget: { id, checked } = {} } = ev || {}
        return getElementsAdjustedByCheckboxStatuses({ id, checked })
    }))

    nextSlideButton.addEventListener('click', () => getAllElementsAndSelectedOne()
        .then(activateNextOne)
        .then(deactivateCurrent)
    )

    const prevSlideButton = document.getElementById('carousel-control-prev-button')

    prevSlideButton.addEventListener('click', () => getAllElementsAndSelectedOne()
        .then(activatePrevOne)
        .then(deactivateCurrent)
    )

    selectRoverEl.addEventListener('click', () => {
        const { cameras, rovers, photos } = store
        const getCarouselElWithCameras = getCarouselEl(cameras)
        const selectorContainerEl = document.getElementById('rover-options-container')
        const { value } = selectorContainerEl
        const selectedRoverId = parseInt(value, 10)
        const selectedCameras = cameras
            .filter(({ roverId }) => selectedRoverId === roverId)
        const photosByCamera = selectedCameras
            .reduce((acc, { id, name }) => {
                const cameraPhotos = photos.filter(({ cameraId }) => id === cameraId)
                return [...acc, { name, qtd: cameraPhotos.length }]
            }, [])
            .sort((a, b) => b.qtd - a.qtd)
            .map(({ name, qtd }) => (`${name} (${qtd})`))
            .join(", ")
        const cameraNames = selectedCameras.map(({ name, fullName }) => (`${fullName} (${name})`)).join(", ")
        const selectedRover = rovers.find(({ id }) => selectedRoverId === id)
        const selectedPhotos = photos.filter(({ roverId }) => selectedRoverId === roverId)
        const roverInfoContainerEl = document.getElementById('rover-info-container')
        // const roverNameEl = document.createElement("div")
        // roverNameEl.innerText = `Name: ${selectedRover.name}`
        const launchDateEl = document.createElement("div")
        const launchText = new Date(selectedRover.launchDate).toDateString()
        const landingDateEl = document.createElement("div")
        launchDateEl.innerHTML = `
            Launch: <span id=\"launch-date-field-shown\">${launchText}</span
            ><span id=\"launch-date-field-hidden\">&lt;hidden&gt;</span>
        `
        const landingText = new Date(selectedRover.landingDate).toDateString()
        landingDateEl.innerHTML = `
            Landing: <span id=\"landing-date-field-shown\">${landingText}</span
            ><span id=\"landing-date-field-hidden\">&lt;hidden&gt;</span>
        `
        const cameraNamesEl = document.createElement("div")
        cameraNamesEl.innerHTML = `
            Cameras: <span id=\"cameras-field-shown\">${cameraNames}</span
            ><span id=\"cameras-field-hidden\">&lt;hidden&gt;</span>
        `
        const statusEl = document.createElement("div")
        statusEl.innerHTML = `
            Status: <span class="capitalize" id="status-field-shown">${selectedRover.status}</span
            ><span id="status-field-hidden">&lt;hidden&gt;</span>
        `
        // const photosByCameraEl = document.createElement("div")
        // photosByCameraEl.innerText = `Photos: ${photosByCamera}`
        const roverDataEls = [launchDateEl, landingDateEl, statusEl, cameraNamesEl]
        const roverDetailEls = document.getElementsByClassName("rover-details-item")
        Array.from(roverDetailEls).forEach(el => el.remove())
        const roverPhotosEls = document.getElementsByClassName("rover-photo-item")
        Array.from(roverPhotosEls).forEach(el => el.remove())
        const carouselSlidesContainer = document.getElementById("rover-images-carousel")
        const photosEls = selectedPhotos.map(getCarouselElWithCameras)
        roverInfoContainerEl.replaceChildren(...roverDataEls)
        carouselSlidesContainer.replaceChildren(...photosEls)
        const checkboxStatuses = document.getElementsByClassName('display-info-check')
        Array.from(checkboxStatuses).forEach(getElementsAdjustedByCheckboxStatuses)

        return [roverInfoContainerEl, carouselSlidesContainer]
    })

    const loaderId = 'page-loader'
    const goButtonId = 'select-rover'
    const roverSelectorId = 'rover-options-container'

    const loadingState = setLoadingState({ loaderId, goButtonId, roverSelectorId })

    loadingState({ isLoading: true })

    getImagesFromNasa()
        .then(getPhotosCamerasAndRovers)
        .then(({ photos, cameras, rovers }) => {
            // TODO:here we should update immutable object to have a new version
            // TODO: use ImmutableJS
            // const photosState = store.get("photos")
            // const newPhotosState = photosState.merge(photos)
            // const camerasState = store.get("cameras")
            // const newCamerasState = camerasState.merge(cameras)
            // const roversState = store.get("rovers")
            // const newRoversState = roversState.merge(rovers)
            return Object.assign(store, { cameras, photos, rovers })
        })
        .then(({ rovers = [] }) => {
            // TODO: get data from store
            const selectorContainerEl = document.getElementById('rover-options-container')
            const roversOptEls = rovers.map(({ id, name }, index) => {
                const optionEl = document.createElement("option")
                if (0 === index) { optionEl.selected = true }
                optionEl.value = id
                optionEl.innerText = name
                return optionEl
            })
            return selectorContainerEl.replaceChildren(...roversOptEls)
        })
        .finally(() => loadingState({ isLoading: false }))
})()
