const GITHUB_BASE_URL = "https://api.github.com/repos/shabdvasudeva/Channel-Updates/contents/";
const GITLAB_TREE_URL = "https://gitlab.com/api/v4/projects/68090229/repository/tree?ref=main";
const GITLAB_BASE_RAW = "https://gitlab.com/api/v4/projects/68090229/repository/files/";

document.getElementById("theme-toggle").addEventListener("click", () => {
  const body = document.documentElement;
  const isDark = body.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

document.getElementById("home-btn").addEventListener("click", () => {
  document.getElementById("content").style.display = "grid";
  document.getElementById("news").style.display = "none";
});

document.getElementById("news-btn").addEventListener("click", () => {
  document.getElementById("content").style.display = "none";
  document.getElementById("news").style.display = "block";
});

async function fetchAllJsonFiles() {
  await fetchJsonFromGitHub();
  await fetchJsonFromGitLab();
}

async function fetchJsonFromGitHub() {
  try {
    let response = await fetch(GITHUB_BASE_URL);
    let files = await response.json();
    let jsonFiles = files.filter(file => file.name.endsWith(".json"));
    
    jsonFiles.forEach(file => fetchFiles(file.download_url, "github"));
  } catch (error) {
    console.error("Error fetching GitHub repo contents:", error);
  }
}

async function fetchJsonFromGitLab() {
  try {
    let response = await fetch(GITLAB_TREE_URL);
    let files = await response.json();
    let jsonFiles = files.filter(file => file.name.endsWith(".json"));
    
    jsonFiles.forEach(file => {
      let fileUrl = `${GITLAB_BASE_RAW}${encodeURIComponent(file.path)}/raw?ref=main`;
      fetchFiles(fileUrl, "gitlab");
    });
  } catch (error) {
    console.error("Error fetching GitLab repo contents:", error);
  }
}

async function fetchFiles(jsonUrl, source) {
  try {
    let response = await fetch(jsonUrl);
    let files = await response.json();
    
    files.forEach(file => {
      let imageUrl = source === "github" ?
        `https://raw.githubusercontent.com/shabdvasudeva/Channel-Updates/main/${file.img}` :
        `https://gitlab.com/shabdvasudeva/apw-database/-/raw/main/${file.img}`;
      
      createCard(file.title, file.instructions, imageUrl, file.link);
    });
  } catch (error) {
    console.error(`Error fetching JSON from ${jsonUrl}:`, error);
  }
}

function createCard(title, instructions, imageUrl, link) {
  let card = document.createElement("div");
  card.classList.add("card");
  
  let htmlContent = `
    <img src="${imageUrl}" alt="Banner">
    <p1>${title}</p1>
    <p>${instructions}</p>`;
  
  if (link) {
    htmlContent += `
      <div class="download-btn">
        <md-filled-button onclick="window.open('${link}', '_blank')">Download</md-filled-button>
      </div>`;
  }
  
  card.innerHTML = htmlContent;
  document.getElementById("content").appendChild(card);
}

document.getElementById("search").addEventListener("input", function() {
  let searchTerm = this.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    let title = card.querySelector("p1").innerText.toLowerCase();
    card.style.display = title.includes(searchTerm) ? "block" : "none";
  });
});

fetchAllJsonFiles();