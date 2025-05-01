
    
    
    function 
    
    changeLanguage(lang) {
        const elements = document.querySelectorAll("[data-lang]");
        elements.forEach((el) => {
            el.style.display = el.getAttribute("data-lang") === lang ? "" : "none";
        });

        document.querySelectorAll(".language-btn").forEach((btn) => {
            btn.classList.remove("active");
        });
        document.getElementById(`lang-${lang}`).classList.add("active");

        displayComments(); // Refresh comments for the selected language
    }

    function navigateToPage(url) {
        if (url) {
            location.href = url;
        }
    }

    // Automatic theme detection
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add("dark-mode");
    }
    
    document.getElementById("theme-toggle").addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });

    changeLanguage("en");

    // Default sorting order
let sortOrder = { type: 'recent', direction: 'desc' };

// Handle comment submission
document.getElementById('comment-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission (page reload)

    const commentText = document.getElementById('comment-text').value.trim();
    if (!commentText) return; // Do nothing if the comment is empty

    // Get existing comments from localStorage or initialize an empty array
    const comments = JSON.parse(localStorage.getItem('comments')) || [];

    // Add the new comment
    comments.push({
        text: commentText,
        date: new Date().toISOString(),
        likes: 0 // Initialize with 0 likes
    });

    // Save updated comments back to localStorage
    localStorage.setItem('comments', JSON.stringify(comments));

    // Clear the input field
    document.getElementById('comment-text').value = '';

    // Refresh the comments display
    displayComments();
});

// Handle sorting order
function setSortOrder(type, direction) {
    sortOrder = { type, direction };
    displayComments();
}

// Toggle like for a comment
function toggleLike(index) {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments[index].likes += 1; // Increment likes for the selected comment
    localStorage.setItem('comments', JSON.stringify(comments));
    displayComments(); // Refresh the comments display
}

// Display comments dynamically
function displayComments() {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];

    // Sort comments based on the current sort order
    comments.sort((a, b) => {
        if (sortOrder.type === 'liked') {
            return sortOrder.direction === 'desc' ? b.likes - a.likes : a.likes - b.likes;
        } else if (sortOrder.type === 'recent') {
            return sortOrder.direction === 'desc'
                ? new Date(b.date) - new Date(a.date)
                : new Date(a.date) - new Date(b.date);
        }
        return 0;
    });

    // Get the container for comments
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = ''; // Clear existing comments

    // Add each comment to the container
    comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
            <p>${comment.text}</p>
            <small>${new Date(comment.date).toLocaleString()}</small>
            <button class="like-btn" onclick="toggleLike(${index})">❤️ ${comment.likes}</button>
        `;
        commentsContainer.appendChild(commentElement);
    });
}

// Initialize comments display on page load
displayComments();
