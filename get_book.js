// https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run
//
// Node.js script to send POST request and log response
const getBook = async () => {
  try {
    // Configure your endpoint and data here
    const url =
      "https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run/get-book"; // Example endpoint
    const postData = {
      book_id: "27c2104f-591a-4b51-a58b-c6906d99a05f",
    };

    console.log("Sending POST request to:", url);
    console.log("Request data:", postData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const responseData = await response.json();

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));
    console.log("Response data:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error making POST request:", error.message);
  }
};

const setSpellingBook = async (book_id, chapter, words) => {
  try {
    // Configure your endpoint and data here
    const url =
      "https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run/update-words"; // Example endpoint
    const postData = {
      book_id,
      chapter: chapter ?? 1,
      words,
    };

    console.log("Sending POST request to:", url);
    console.log("Request data:", postData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const responseData = await response.json();

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));
    console.log("Response data:", responseData);
  } catch (error) {
    console.error("Error making POST request:", error.message);
  }
};

const getWords = async (book_title, book_author, chapter) => {
  try {
    // Configure your endpoint and data here
    const url =
      "https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run/generate-words";
    const postData = {
      request_text: `From Chapter ${chapter} of the book "${book_title}" by ${book_author}, select 10 interesting and age-appropriate vocabulary words (for children aged 6–12) that appear directly in the text and would be fun to use in a spelling game. The words should be of different lengths, from 5 characters to longer words, with different spelling complexity. Do not include names of characters or places.`,
      llm: "gemini",
    };

    console.log("Sending POST request to:", url);
    console.log("Request data:", postData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const responseData = await response.json();

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));
    console.log("Response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error making POST request:", error.message);
  }
};

const getSummary = async (
  book_title,
  book_author,
  book_id,
  chapter,
  save = false,
) => {
  try {
    // Configure your endpoint and data here
    const url =
      "https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run/summarize";
    const postData = {
      request_text: `Summarize Chapter ${chapter} of the book "${book_title}" by ${book_author}.`,
      llm: "gemini",
      book_id: book_id,
      chapter: chapter,
      save,
    };

    console.log("Sending POST request to:", url);
    console.log("Request data:", postData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const responseData = await response.json();

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));
    console.log("Response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error making POST request:", error.message);
  }
};

// const words = await getWords(book.title, book.author, CHAPTER);
//
const setSummaries = async (book, chapter = 0) => {
  const summary = await getSummary(
    book.title,
    book.author,
    book.id,
    chapter + 1,
    true,
  );
  // await setSpellingBook(book.id, CHAPTER, words.words);

  // console.log("SUCCESSFULLY UPDATED");
  console.log(book);
  console.log(summary);

  if (chapter < book.chapters - 1) {
    await setSummaries(book, chapter + 1);
  }
};
// console.log(words);
//
//
const book_id = "cfbc9f78-64a1-4f70-a242-b259d58399d0";
const book = await getBook(book_id);

setSummaries(book, 8);
