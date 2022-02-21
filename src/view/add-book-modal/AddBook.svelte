<script lang="ts">
  import { debounce } from "lodash";
  import { getContext, onMount } from "svelte";

  import {
    getISBN,
    search,
    WrappedResults,
  } from "src/services/book-search/google";
  import { BookToAdd } from "src/library/add";
  import BookResult from "./BookResult.svelte";

  let previousTerm = "";
  let results: WrappedResults[] = [];
  let inputRef: HTMLInputElement;

  const doSearch = debounce(async (term) => {
    results = await search(term);
  }, 400);

  const addBook: (book: BookToAdd) => void = getContext("addBook");

  onMount(() => {
    inputRef.focus();
  });
</script>

<div class="red-book-search">
  <h1>Add Book</h1>

  <input
    bind:this={inputRef}
    on:keyup={(event) => {
      // @ts-ignore
      const v = event.target.value;
      console.log(v);
      if (v && (v.length > 0 || v !== previousTerm)) {
        doSearch(v);
        previousTerm = v;
      }
    }}
  />

  <ol>
    {#each results as result}
      <BookResult
        result={result.volumeInfo}
        on:click={() => {
          console.log(result);
          addBook({
            title: result.volumeInfo.title,
            subtitle: result.volumeInfo.subtitle,
            authors: result.volumeInfo.authors,
            isbn: getISBN(result.volumeInfo),
            cover: result.volumeInfo.imageLinks.thumbnail,
            readthroughs: [
              {
                start: null,
                end: null,
              },
            ],
          });
        }}
      />
    {/each}
  </ol>
</div>

<style>
  .red-book-search input {
    width: 100%;
  }

  ol {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
</style>
