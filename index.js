const APIKEY = "8c15c4aa"
const txtinput = document.querySelector("#search_input")
const searchbtn = document.querySelector("#search_btn")
const showfavbtn = document.querySelector("#show_fav_btn")
const msgtxt = document.querySelector("#msg_txt")
const resultcontainer = document.querySelector(".result_container")
const detailscontainer = document.querySelector(".details_container")
const backbtn = document.querySelector("#backbtn")
const moviepic = document.querySelector("#movie_pic")
const movietitle = document.querySelector("#movie_title")
const moviemeta = document.querySelector("#movie_meta")
const movierating = document.querySelector("#movie_rating")
const movieplot = document.querySelector("#movie_plot")
const addfavbtn = document.querySelector(".favorite_btn")
const favcontainer = document.querySelector(".fav_container")

function HandleError(error){

    msgtxt.style.display = "block"
    msgtxt.textContent = error.message
    msgtxt.classList.remove("checked")

    resultcontainer.style.display = "none"
    detailscontainer.style.display = "none"
    favcontainer.style.display = "none"

}

function SetLoading(){
    msgtxt.style.display = "block"
    msgtxt.textContent = "Loading..."
    msgtxt.classList.remove("checked")
    
    resultcontainer.style.display = "none"
    detailscontainer.style.display = "none"
    favcontainer.style.display = "none"
}

function ShowResult(){
    resultcontainer.style.display = "grid"

    msgtxt.style.display = "none"
    detailscontainer.style.display = "none"
    favcontainer.style.display = "none"

    backbtn.dataset.prev = "result"
}

function ShowDetails(){
    
    detailscontainer.style.display = "block"
    
    msgtxt.style.display = "none"
    resultcontainer.style.display = "none"
    favcontainer.style.display = "none"
}

function showfavorites(savnumb){
    
    favcontainer.style.display = "grid"
    
    resultcontainer.style.display = "none"
    detailscontainer.style.display = "none"
    
    msgtxt.style.display = "block"
    if (!msgtxt.classList.contains("checked")){
        msgtxt.classList.add("checked")
        msgtxt.textContent = `Your Favorites : \n you saved ${savnumb} movies`
        backbtn.dataset.prev = "favorites"

    }
}

function renderposts(movies){
    
    ShowResult()
    resultcontainer.innerHTML = ""
    
    movies.forEach(movie => {
        const card = document.createElement("div")
        const cover = document.createElement("img")
        const title = document.createElement("h3")
        const year = document.createElement("p")
        
        card.className = "movie_card"
        
        cover.className = "movie_cover"
        cover.src = movie.Poster
        
        title.className = "movie_title"
        title.textContent = movie.Title
        
        year.className = "movie_year"
        year.textContent = movie.Year
        
        card.dataset.id = movie.imdbID
        
        card.append(cover)
        card.append(title)
        card.append(year)
        
        resultcontainer.append(card)
    });
    
}

function renderdetails(movie){

    let favoritemovies = JSON.parse(localStorage.getItem("favorites")) || []
    
    ShowDetails()
    
    moviepic.src = movie.Poster
    movietitle.textContent = movie.Title
    movietitle.dataset.id = movie.imdbID
    moviemeta.textContent = `${movie.Year} • ${movie.Genre} • ${movie.Runtime}` 
    moviemeta.dataset.year = movie.Year
    movierating.textContent = "⭐ " + movie.imdbRating + "/10"
    movieplot.textContent = movie.Plot

    if (favoritemovies.some(item => item.id === movie.imdbID )){
        addfavbtn.classList.add("checked")
        addfavbtn.textContent = "✓ Saved to Favorites"
    }
    else {
        addfavbtn.classList.remove("checked")
        addfavbtn.textContent = "♡ Add to Favorites"
        
    }
}

function renderfavorites(){

    const favoritemovies = JSON.parse(localStorage.getItem("favorites")) || []

    if (favoritemovies.length == 0){
        HandleError(new Error("No favorites yet — start adding movies!"))
    }
    else{

        showfavorites(favoritemovies.length)
        favcontainer.innerHTML = ""

        favoritemovies.forEach(movie => {
            const card = document.createElement("div")
            const cover = document.createElement("img")
            const title = document.createElement("h3")
            const year = document.createElement("p")
            
            card.className = "movie_card"
            
            cover.className = "movie_cover"
            cover.src = movie.poster
            
            title.className = "movie_title"
            title.textContent = movie.title
            
            year.className = "movie_year"
            year.textContent = movie.year
            
            card.dataset.id = movie.id
            
            card.append(cover)
            card.append(title)
            card.append(year)

            favcontainer.append(card)
        })
    }
} 

async function GetMovieInfo(){
    
    try{
        if(!txtinput.value.trim()){
            throw new Error("movie name must not be empty")
        }
        
        SetLoading()

        const res = await fetch(`https://www.omdbapi.com/?apikey=${APIKEY}&s=${txtinput.value.trim()}`)
        if(!res.ok){
            throw new Error("network Error"); 
        }

        const data = await res.json()

        if(data.Response == "False"){
            throw new Error(data.Error)
        }

        renderposts(data.Search)

    }
    catch(error){
        HandleError(error)
    }
    
}

async function GetMovieDetails(id){

    try{
        SetLoading()
        
        const res = await fetch(`https://www.omdbapi.com/?apikey=${APIKEY}&i=${id}`)
        
        if(!res.ok) throw new Error("network error");
            
        const data = await res.json()
        
        
        if(data.Response !== "True"){
            throw new Error("error fetching data")
        }
        renderdetails(data)
    }
    catch(error){
        HandleError(error)
    }
}

function togglefav(){
    let favoritemovies = JSON.parse(localStorage.getItem("favorites")) || []

    const exists = favoritemovies.some(movie => movie.id == movietitle.dataset.id)

    if (exists){
        let newfav = favoritemovies.filter(item => 
            item.id !== movietitle.dataset.id
        )
        localStorage.setItem("favorites", JSON.stringify(newfav))
    }

    else{
        favoritemovies.push({
            id : movietitle.dataset.id,
            poster : moviepic.src,
            title :movietitle.textContent,
            year :moviemeta.dataset.year
        })
        localStorage.setItem("favorites", JSON.stringify(favoritemovies))
    }
}

searchbtn.addEventListener("click", () => {
    GetMovieInfo()
    txtinput.value = ""
})
txtinput.addEventListener("keyup", (event) => {

    if(event.key == "Enter"){
        GetMovieInfo()
        txtinput.value = ""
    }
})

resultcontainer.addEventListener("click", (e) => {

    if(e.target.closest(".movie_card")){
        GetMovieDetails(e.target.closest(".movie_card").dataset.id)
    }
})

backbtn.addEventListener("click", () => {
    if(backbtn.dataset.prev === "result"){
        ShowResult()
    }
    else if (backbtn.dataset.prev === "favorites"){
        renderfavorites()
    }
})

addfavbtn.addEventListener("click", () => {

    togglefav()

    if (addfavbtn.classList.contains("checked")){
        
        addfavbtn.classList.remove("checked")
        addfavbtn.textContent = "♡ Add to Favorites"
    }
    else {
        addfavbtn.classList.add("checked")
        addfavbtn.textContent = "✓ Saved to Favorites"
    }
})

showfavbtn.addEventListener("click", renderfavorites)

favcontainer.addEventListener("click", (e) => {

    if(e.target.closest(".movie_card")){
        GetMovieDetails(e.target.closest(".movie_card").dataset.id)
    }
})