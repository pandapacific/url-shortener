// interactiveness
const navButton = document.querySelector('.navButton');
const copyLink = document.querySelector('.copyLink');
const body = document.querySelector('body');
const navMenu = document.querySelector('.navMenu');
navButton.addEventListener('click',
    () => {
        navMenu.classList.toggle('hidden');
        body.classList.toggle('overflow-hidden');
    }
);

// copy to clipboard functionality
const shortUrlsContainer = document.querySelector('.shortUrls');

shortUrlsContainer.addEventListener('click', async (e) => {
    const copyLink = e.target.closest('.copyLink');
    if (!copyLink) return; //only proceed if copy button is clicked

    if (copyLink.textContent === 'Copied!') return; //prevent multiple clicks
    const shortLink = copyLink.previousElementSibling;
    if (!shortLink) return; //safety check  

    // Copy to clipboard
    await navigator.clipboard.writeText(shortLink.textContent);

    //Change button content and style
    copyLink.textContent = 'Copied!';
    copyLink.classList.remove('bg-[hsl(180,66%,49%)]', 'hover:bg-[hsl(180,66%,60%)]');
    copyLink.classList.add('bg-[hsl(257,27%,26%)]');

    //revert button after 3 seconds
    setTimeout(() => {
        copyLink.textContent = 'Copy';
        copyLink.classList.remove('bg-[hsl(257,27%,26%)]');
        copyLink.classList.add('bg-[hsl(180,66%,49%)]', 'hover:bg-[hsl(180,66%,60%)]');
    }, 3000);

});

// form validation
const form = document.querySelector('form');
const formInput = document.querySelector('.formInput');

//helper functions
const showError = (message) => {
    const error = document.querySelector('.error');
    error.textContent = message;
    error.classList.remove('invisible');
    formInput.classList.remove('focus:border-[hsl(180,66%,60%)]', 'text-[hsl(257,7%,33%)]');
    formInput.classList.add('focus:border-red-400', 'text-red-400');
    formInput.focus();
}
const isValidLink = (link) => {
    const regex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
    return regex.test(link);
}
const clearError = () => {
    const error = document.querySelector('.error');
    error.textContent = '';
    error.classList.add('invisible');
    formInput.classList.remove('focus:border-red-400', 'text-red-400');
    formInput.classList.add('focus:border-[hsl(180,66%,60%)]', 'text-[hsl(257,7%,33%)]');
}
const inputValidation = (input) => {
    if (!input) {
        showError('Input cannot be empty');
        return;
    }
    if (!isValidLink(input)) {
        showError('Please enter a valid URL');
        return;
    }

    clearError(); // remove error message if data is completely valid
    formInput.value = ''; // clear input field
    return input
}
const shortenLink = async (input) => {
    try {
        const response = await fetch("/api/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: input }),
        });
        // if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        const linkObj = {
            id: Date.now(),
            original: input,
            shortened: data.result_url
        };
        return linkObj;
    } catch (error) {
        showError('Failed to shorten link. Please try again.');
        console.error(error.stack);
        return null;
    }
}
const normalizeUrl = (url) => {

    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }
    return url;
};
const reveal = (elem) => {
    elem.classList.remove('hidden');
    elem.classList.add('flex');
}
const modClone = (linkObj, clone) => {
    const originalLink = clone.querySelector('.originalLink');
    const shortLink = clone.querySelector('.shortLink');
    originalLink.textContent = linkObj.original;
    shortLink.textContent = linkObj.shortened;
    clone.id = linkObj.id;
    clone.classList.remove('hidden');
    clone.classList.add('flex');
    return clone;
}
const renderLink = (linksArray) => {
    if (linksArray.length == 0) return;
    const template = document.getElementById('urlTemplate');
    // reveal container if hidden
    if (shortUrlsContainer.classList.contains('hidden')) reveal(shortUrlsContainer);

    linksArray.forEach(linkObj => {
        const clone = template.content.cloneNode(true).firstElementChild;
        const modifiedClone = modClone(linkObj, clone);
        if (document.getElementById(linkObj.id)) return; //prevent duplicates
        shortUrlsContainer.appendChild(modifiedClone);
    })

}
const linksArray = []; //store all shortened links

//event listeners
formInput.addEventListener('input', () => {
    const error = document.querySelector('.error');
    // Only clear if an error is currently shown
    if (!error.classList.contains('invisible')) {
        clearError();
    }
});
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputData = formInput.value.trim();

    const validatedInput = inputValidation(inputData);
    if (!validatedInput) return; //stop if input is invalid

    const normalizedInput = normalizeUrl(validatedInput);

    const linkObj = await shortenLink(normalizedInput); //fetch shortened link
    linksArray.push(linkObj);
    console.log(linksArray) //store link object
    renderLink(linksArray);
})