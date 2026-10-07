// <--- ---- ---- Section 2 ---- ---- --->
const questions = document.querySelector(".questions");
const questionsContainer = document.querySelector(".questions-container");
let position = 0;
const speed = 1;
let mouse = false;
function moveQuestions() {
  if(!mouse){ 
		position -= speed;
    const resetPoint = questions.scrollWidth / 2 + 5;
    if (Math.abs(position) >= resetPoint) {
        position = 0;
    }
    questions.style.transform = `translateX(${position}px)`;
  }
  requestAnimationFrame(moveQuestions);
}
questionsContainer.addEventListener("mouseenter", () => {
	mouse = true;
});
questionsContainer.addEventListener("mouseleave", () => {
	mouse = false;
});
moveQuestions();

// <--- ---- ---- Section 3 Image change ---- ---- --->
const filoimage = document.querySelector(".filoimage");
const chatgptimg = document.querySelector(".chatgptimage");
const changequestion = document.querySelector(".changingques");
const scroll = document.querySelectorAll(".scrollimg");

const chem = document.querySelector("#chemimg");
chem.addEventListener("click", () => {
	scroll.forEach(img => {
		img.scrollTop = 0;
	});
	filoimage.src = "chem-filo.png";
	chatgptimg.src = "chem-gpt.png";
	chem.id = "subactive";
	math.id = "";
	phys.id = "";
	bio.id = "";
	geo.id = "";
	changequestion.textContent = "Compare the structures and properties of Graphite and Diamond using labeled diagram and a property table."
});

const math = document.querySelector("#mathimg");
math.addEventListener("click", () => {
	scroll.forEach(img => {
		img.scrollTop = 0;
	});
	filoimage.src = "math-filo.png";
	chatgptimg.src = "math-gpt.png";
	chem.id = "";
	math.id = "subactive";
	phys.id = "";
	bio.id = "";
	geo.id = "";
	changequestion.textContent = "Plot the graph of y=sinxy = sin xy=sinx and y=cosxy = cos xy=cosx on the same axes and compare their features";
});

const phys = document.querySelector("#phyimg");
phys.addEventListener("click", () => {
	scroll.forEach(img => {
		img.scrollTop = 0;
	});
	filoimage.src = "physics-filo.png";
	chatgptimg.src = "physics-gpt.png";
	chem.id = "";
	math.id = "";
	phys.id = "subactive";
	bio.id = "";
	geo.id = "";
	changequestion.textContent = "Show a ray diagram for image formation by a convex lens for an object beyond 2F.";
});

const bio = document.querySelector("#bioimg");
bio.addEventListener("click", () => {
	scroll.forEach(img => {
		img.scrollTop = 0;
	});
	filoimage.src = "bio-filo.png";
	chatgptimg.src = "bio-gpt.png";
	chem.id = "";
	math.id = "";
	phys.id = "";
	bio.id = "subactive";
	geo.id = "";
	changequestion.textContent = "Draw and label the structure of a plant cell and mention one key difference from an animal cell.";
});

const geo = document.querySelector("#geoimg");
geo.addEventListener("click", () => {
	scroll.forEach(img => {
		img.scrollTop = 0;
	});
	filoimage.src = "geo-filo.png";
	chatgptimg.src = "geo-gpt.png";
	chem.id = "";
	math.id = "";
	phys.id = "";
	bio.id = "";
	geo.id = "subactive";
	changequestion.textContent = "Use a climate map of the world to identify and compare tropical, temperate, and polar zones.";
});

function currentlyActive(){
	chem.id = "subactive";
}
currentlyActive();

// <--- ---- ---- Section 4 Video Play ---- ---- --->
const videos = document.querySelectorAll(".videoseach");
videos.forEach(video => {
	video.addEventListener("mouseenter", () => {
		video.play();
	});
});

videos.forEach(video => {
	video.addEventListener("mouseleave", () => {
		video.currentTime = 0;
		video.pause();
	});
});

// <--- ---- ---- Section 8 News Carousel ---- ---- --->
const newsholder = document.querySelector(".newsimgholder");
const newsContainer = document.querySelector(".newsimg-container");
let newsposition = 0;
let news = false;
function moveNews(){
	if(!news){
		newsposition -= speed;
		const reset = newsholder.scrollWidth / 2;
		if (Math.abs(newsposition) >= reset){
			newsposition = 0;
		}
		newsholder.style.transform = `translateX(${newsposition}px)`;
	}
	requestAnimationFrame(moveNews);
}
moveNews();

newsContainer.addEventListener("mouseenter", () => {
	news = true;
});
newsContainer.addEventListener("mouseleave", () => {
	news = false;
});