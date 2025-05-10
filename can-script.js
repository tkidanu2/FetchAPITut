//use fetch to retrieve the products and pass them to init
// report any errors that occur in the fetch operation
//once the products have been successfully loaded and formatted as a JSON object
// using response.json(), run the initialize() function

fetch('products,json')
    .then( response => {
        if(!response.ok){
            throw new Error('Network response was not ok' + response.status);
        }
        return response.json();
    })
    .then(json => initialize(json))
    .catch( err => console.error('There was a problem with the fetch operation:', err));

    // sets up the app logic, declares required variables, contains all the other functions

    function initialize(products){
        // grab the UI elements that we need to manipulate
        const category = document.querySelector('#category');
        const searchTerm = document.querySelector('#searchTerm');
        const searchBtn = document.querySelector('button');
        const main = document.querySelector('main');

        //Keep a record of what the last category were
        let lastCategory =  category.value;
        //no search has been made yet
        let lastSearch = '';

        // these contain the results of filtering by category, and search term
        // finalGroup will contain the products that need to be displayed after the searching has been done. Each will be an array containing the objects. Each object will represent a product.

        let categoryGroup;
        let finalGroup;

        // To start with, set finalGroup to equal the entire products database then run updateDisplay(), so ALL products are displayed initially.

        finalGroup = products;
        updateDisplay();

        // Set both to equal an empty array, in time for searches to be run
        categoryGroup = [];
        finalGroup = [];

        // when the search button is clicked, invoke selectCategory() to start a search running to select the category of products we want to display

        searchBtn.addEventListener('click', selectCategory);

        function selectCategory(e){
            // Use preventDefault() to stop the form submitting - that would ruin the experience
            e.preventDefault();

            //Set these back to empty arrays, to clear out the previous search
            categoryGroup = [];
            finalGroup = [];

            //if the category and search term are the same as they were the last time a search was run, the results will be the same, so there is no point running it again - just return out of the function
            if (category.value === lastCategory && searchTerm.value.trim() == lastSearch){
                return;
            } else{
                // update the record of last category and search term
                lastCategory = category.value;
                lastSearch = searchTerm.value.trim();
                //In this case, we want to select all products, then filter them by the search term, so we just set categoryGroup to the entire JSON object, then run selectProducts()

                if(category.value === 'All'){
                    categoryGroup = products;
                    selectProducts();
                    //If a specific category is chosen, we need to filter out th products not in that category, then put the remaining products inside categoryGroup, before running selectProducts()
                } else {
                    //the values in the <option> elements are uppercase, whereas the categories store in the JSON(under "type") are lowercase. We therefore need to convert to lower case before we do a comparison
                    const lowerCaseType = category.value.toLowerCase();
                    // filter categoryGroup to contain only products whose type includes the category
                    categoryGroup = products.filter( product => product.type === lowerCaseType);

                    // run selectProducts() to filter categoryGroup by the search term
                    selectProducts();
                }
            }
        }

        // selectProducts() Takes the group of products selected by selectCategory(), and further filters them by the tiered search term (if one has been entered)
        function selectProducts(){
            // if no search term has been entered, just make the finalGroup array equal to the categoryGroup array - we don't want to filter the products further.
            if(searchTerm,value.trim() === ''){
                finalGroup = categoryGroup;
            } else {
                //Make sure the search term is converted to lower case before comparison. We've kept the product names all lower case to keep things simple
                const lowerCaseSearchTerm = searchTerm.value.trim().toLowerCase();

            // filter finalGroup to contain only products whose name includes the search term
            finalGroup = categoryGroup.filter(product => product.name.includes(lowerCaseSearchTerm));
            }
            // Once we have the finalGroup, update the display
            updateDisplay();
        }

        // start the process of updating the display with the new set of products
        function updateDisplay(){
            //remove the previous content of the <main> element
            while(main.firstChild){
                main.removeChild(main.firstChild);
            }

            //if no products match the search ter, display a "No results to display" message
            if(finalGroup.length === 0){
                const para = document.createElement('p');
                para.textContent = 'No results to display';
                main.appendChild(para);
                //for each product we want to display, pass its product object to fetchBlob()
            }else {
                for(const product of finalGroup){
                    fetchBlob(product);
                }
            }
        }

        //fetchBlob uses fetch to retrieve the image for that product, and then sends the resulting image display URL and product object on to showProduct() to finally display it

        function fetchBlob(product){
            //construct the URL path to the image file from the product.image property
            const url = `images/${product.image}`;
            //Use fetch to fetch the image, and convert the resulting response to a blob
            //Again, if any errors occur we report them in the console.
            fetch(url)
                .then(response => {
                    if(!response.ok){
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    return response.blob();
                })
           .then (blob => showProduct(blob, product))
           .catch(err => console.error(`Fetch problem: ${err.message}`));     
        }

