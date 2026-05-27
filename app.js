// 1. Firebase Configuration - REPLACE THIS WITH YOUR OWN CONFIG FROM FIREBASE
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvRcvIcYWlyCempXHZfmqC1ZLlogau7vc",
  authDomain: "my-daily-blog-c1ac0.firebaseapp.com",
  databaseURL: "https://my-daily-blog-c1ac0-default-rtdb.firebaseio.com",
  projectId: "my-daily-blog-c1ac0",
  storageBucket: "my-daily-blog-c1ac0.firebasestorage.app",
  messagingSenderId: "426653371415",
  appId: "1:426653371415:web:bbdf611b2068e74ca6e052",
  measurementId: "G-6BJDPMV2CD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. DOM Elements
const blogGrid = document.getElementById('blogGrid');
const uploadModal = document.getElementById('uploadModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const blogForm = document.getElementById('blogForm');
const submitBtn = document.getElementById('submitBtn');

// 3. Modal Toggles
openModalBtn.addEventListener('click', () => uploadModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => uploadModal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === uploadModal) uploadModal.classList.add('hidden');
});

// 4. Fetch and Listen to Blogs Dynamically from Cloud Firestore
// 'onSnapshot' updates the page automatically across all audience screens whenever you add a new post
db.collection("blogs").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    blogGrid.innerHTML = '';
    
    if (snapshot.empty) {
        blogGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-400">
                <p class="text-lg">No blogs posted yet. Check back later!</p>
            </div>
        `;
        return;
    }

    snapshot.forEach((doc) => {
        const blog = doc.data();
        const blogId = doc.id;
        
        const blogCard = document.createElement('article');
        blogCard.className = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between p-6';
        
        blogCard.innerHTML = `
            <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600">${blog.date}</span>
                <h3 class="text-xl font-bold text-gray-900 mt-2 mb-3 leading-tight">${blog.title}</h3>
                <p class="text-gray-600 text-sm line-clamp-4 whitespace-pre-line">${blog.content}</p>
            </div>
            <div class="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span>By Author</span>
                <button onclick="deletePost('${blogId}')" class="text-red-400 hover:text-red-600 transition">Delete</button>
            </div>
        `;
        blogGrid.appendChild(blogCard);
    });
});

// 5. Handle Submitting/Publishing a Blog to the Cloud
blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button to prevent double submissions
    submitBtn.disabled = true;
    submitBtn.innerText = "Publishing...";

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    try {
        // Add data directly to Firebase Firestore
        await db.collection("blogs").add({
            title: title,
            content: content,
            date: date,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // ensures correct sorting
        });

        // Reset form and UI
        blogForm.reset();
        uploadModal.classList.add('hidden');
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Failed to publish blog. Check console logs.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Publish Post";
    }
});

// 6. Delete a Post from Cloud Firestore
window.deletePost = async function(id) {
    if(confirm("Are you sure you want to delete this post from the live site?")) {
        try {
            await db.collection("blogs").doc(id).delete();
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    }
}