const imageGrid = document.getElementById('image-grid');
let page = 1;
const limit = 10;
let isLoading = false;
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalAuthor = document.getElementById('modal-author');
const downloadButton = document.getElementById('download-button');
const closeModal = document.getElementById('close-modal');

async function fetchImages() {
    if (isLoading) {
        console.log('Already loading images, skipping fetch...');
        return;
    }
    console.log('Fetching images for page:', page);
    isLoading = true;

    try {
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
        const images = await response.json();

        images.forEach((image) => {
            const linkElement = document.createElement('a');
            linkElement.href = '#';
            linkElement.classList.add('image-link');

            const imgElement = document.createElement('img');
            imgElement.src = image.download_url;
            imgElement.title = `Photo by ${image.author}`;
            imgElement.setAttribute('data-author', image.author);

            linkElement.appendChild(imgElement);
            imageGrid.appendChild(linkElement);
        });

        console.log(`Page ${page} images loaded successfully.`);
        page++;
    } catch (error) {
        console.error('Error fetching images:', error);
    } finally {
        isLoading = false;
    }
}

window.addEventListener('scroll', () => {
    console.log(`Scroll Position: ${window.innerHeight + window.scrollY}`);
    console.log(`Document Height: ${document.body.offsetHeight}`);

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        console.log('Scroll condition met. Loading more images...');
        fetchImages();
    } else {
        console.log('Scroll condition not met yet.');
    }
});

// Initial Fetch
fetchImages();

function openModal(imageUrl, author) {
    modal.classList.remove('hidden'); 
    modalImage.src = imageUrl; 
    modalAuthor.textContent = `Author: ${author}`; 
    downloadButton.href = imageUrl; 
    downloadButton.download = `photo-by-${author.replace(/[^a-zA-Z0-9-]/g, "-")}.jpg`;
    

}

function closeModalHandler() {
    modal.classList.add('hidden'); 
}

closeModal.addEventListener('click', closeModalHandler);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalHandler();
    }
});

imageGrid.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        const imageUrl = e.target.src;
        const author = e.target.getAttribute('data-author');
        openModal(imageUrl, author);
    }
});