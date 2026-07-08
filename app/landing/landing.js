const { label } = require("three/tsl");

function GetEditorVersion() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://synrec-auth.fly.dev/masterEditorVersion`);
    xhr.onloadend = function () {
        const response = xhr.responseText;
        if (response) {
            const div = document.getElementById('version-info');
            if (div) {
                div.textContent = response;
            }
        }
    }
    xhr.send();
}

function GoToHome() {
    window.location.href = "/app/home/home.html";
}

function GetTimeText(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 1) {
        return 'Recently';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) {
        const time_txt = seconds > 1 ? 'Seconds' : 'Second';
        return `${seconds} ${time_txt} Ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 1) {
        const time_txt = minutes > 1 ? 'Minutes' : 'Minute';
        return `${minutes} ${time_txt} Ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 1) {
        const time_txt = hours > 1 ? 'Hours' : 'Hour';
        return `${hours} ${time_txt} Ago`;
    }
    const weeks = Math.floor(days / 7);
    if (weeks < 1) {
        const time_txt = days > 1 ? 'Days' : 'Day';
        return `${days} ${time_txt} Ago`;
    }
    const time_txt = weeks > 1 ? 'Weeks' : 'Week';
    return `${weeks} ${time_txt} ago`;
}

function GetBskyPosts() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://synrec-auth.fly.dev/bskyPosts`);
    xhr.onloadend = function () {
        const response = xhr.responseText;
        let posts = [];
        try {
            posts = JSON.parse(response);
        } catch (e) {
            console.error(`Failed to parse blue sky posts from server.`);
        }
        const bsky_div = document.getElementById(`bsky`);
        if (bsky_div) {
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i].post;
                const author = post.author;
                const author_img = author.avatar;
                const record = post.record;
                const time = new Date(record.createdAt);
                const now = new Date();
                const elapsed = now - time;
                const time_text = GetTimeText(elapsed);
                const post_time = `POSTED: ${time_text}`;
                const post_div = document.createElement('div');
                post_div.id = `bsky-post`;
                bsky_div.appendChild(post_div);
                const post_author_div = document.createElement('div');
                post_author_div.id = `bsky-author-post`;
                post_div.appendChild(post_author_div);
                const author_img_dom = document.createElement('img');
                author_img_dom.id = `author-avatar`;
                author_img_dom.src = author_img;
                author_img_dom.onclick = function () {
                    window.open(`https://${author.handle}`, 'blank');
                }
                post_author_div.appendChild(author_img_dom);
                const author_name_div = document.createElement('div');
                author_name_div.id = `author-name-div`;
                post_author_div.appendChild(author_name_div);
                const post_time_dom = document.createElement('div');
                post_time_dom.id = 'time-handle';
                post_time_dom.textContent = post_time;
                post_time_dom.onclick = function () {
                    window.open(`https://${author.handle}`, 'blank');
                }
                author_name_div.appendChild(post_time_dom);
                const post_record_div = document.createElement('div');
                post_record_div.id = `bsky-record-post`;
                post_div.appendChild(post_record_div);
                const post_text = document.createElement('p');
                post_text.id = `bsky-post-text`;
                post_text.textContent = record.text;
                post_record_div.appendChild(post_text);
            }
        }
    }
    xhr.send();
}