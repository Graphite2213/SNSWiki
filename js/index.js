// Constants (development values)
//const fetchURL = "http://localhost:4000";
//const selfURL = "http://localhost:8080"

// Constants (deployment values)
const fetchURL = "https://raw.githubusercontent.com/Graphite2213/SNSWiki-Pages/master/";
const selfURL = "http://sns.graphite.in.rs"
const currentPage = window.location.pathname.split("/").pop();

// Global variables
let currHover;
let pageTitle;
let locale;
let oppLocale;
let theme;
let refHighlight;
let barToClearNote = false;
let showingDropdown = false;

// Initialize sitewide variables (used in shadow DOM too)
window._searchMeta = "";
window._titles = [];

// On site load
function OnLoad(l) {
    theme = CookieManager.GetCookie("theme");
    if (theme == "dark") SwitchToDark();

    // Assign locale, then wait for search meta to load in, this is necessary to avoid empty search meta in OnLoad()
    locale = l;
    if (locale == 'en') oppLocale = 'rs';
    else oppLocale = 'en';
    GetSearchMeta().then(() => {
        if (currentPage == "wiki") LoadPost();
    });

    document.getElementById("reftooltip").addEventListener("mouseover", HoverRefBox);
    document.getElementById("reftooltip").addEventListener("mouseout", HoverRefBoxClear);
}

// Get all pages, featured articles, meta for locale
async function GetSearchMeta()
{
    const response = await fetch(fetchURL + `${locale}/${locale}-meta.json`, 
    {
        method: "GET",
    });

    if (!response.ok) throw 'bad request';
    window._searchMeta = JSON5.parse(await response.text());
    LoadSidebar();
}

// Load the sidebar
function LoadSidebar()
{
    // For the "wiki" part of the wiki (pages n stuff) load the content, otherwise load the featured articles
    if (currentPage == "wiki")
    {
        setTimeout(() => {
            let allTitles = `<li><b>(Top)</b></li>`;
            window._titles.forEach(e => {
                allTitles += `<li><a class="contentListChild" onclick="ScrollHeaderIntoView(event)">${e}</a></li>`;
            });
            document.getElementById("pageContent").innerHTML = allTitles;
        }, 50);
    }
    if (currentPage == "home")
    {
        const featured = window._searchMeta.featured;
        const news = window._searchMeta.news;

        let featuredList = ``;
        featured.forEach(e => {
            featuredList += `<li>${e}</li>`
        });

        document.getElementById("featuredList").innerHTML = featuredList;

        let newsList = ``;
        news.forEach(e => {
            newsList += `<li>${e}</li>`
        });

        document.getElementById("newsList").innerHTML = newsList;
    }
}

// Because shadow DOM doesn't support # links, we have to scroll headers into view using this.
// ~~TODO: Make this work with id and then add the ability to up-scroll to references too~~ DONE!
function ScrollHeaderIntoView(e)
{
    const allElems = document.getElementById("postText").getElementsByTagName("w-h1");

    for (let i = 0; i < allElems.length; i++)
    {
        if (allElems[i].innerHTML == e.target.innerText) allElems[i].scrollIntoView({ behavior: "smooth" });
    }
}

function ScrollRefIntoView(e)
{
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).scrollIntoView({ behavior: "smooth" })
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).style.backgroundColor = "#f1f4fd";
    if (typeof refHighlight != "undefined") refHighlight.style.backgroundColor = "transparent";
    refHighlight = document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number);
}

// All internal links go through this function
async function InternalLink(e)
{
    const newPage = encodeURI(e.target.getAttribute("data-href"));
    window.location.replace(`${selfURL}/${locale}/wiki?page=` + newPage);
}


class CookieManager {
    static GetCookie(cname) {
        const x = document.cookie.split(";");
        for (let i = 0; i < x.length; i++)
        {
            if (x[i].includes(`${cname}`)) 
            {
                return x[i].split("=")[1];
            }
        }
        return "";
    }

    static SetCookie(cname, value) {
        document.cookie = `${cname}=${value}`;
    }
}

function toggleMobileDropdown()
{
    if (showingDropdown) document.getElementById("mobileDropdown").style.display = "none";
    else document.getElementById("mobileDropdown").style.display = "flex";
    showingDropdown = !showingDropdown;
}