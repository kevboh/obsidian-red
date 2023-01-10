<script lang="ts">
  import { debounce } from "obsidian";
  import { getContext, onMount } from "svelte";
  import { slide } from "svelte/transition";

  import {
    getISBN,
    search,
    SearchResult,
    WrappedResults,
  } from "src/services/book-search/google";
  import { BookToAdd } from "src/library/add";
  import BookResult from "./BookResult.svelte";

  let state: "search" | "readthroughs" = "search";

  let previousTerm = "";
  let results: WrappedResults[] = [];
  let inputRef: HTMLInputElement;
  let toAdd: SearchResult | null = null;

  let readingStatus: "reading" | "read" | "to read" = "reading";
  let start = window.moment().format("YYYY-MM-DD");
  let end = window.moment().format("YYYY-MM-DD");

  const doSearch = debounce(async (term: string) => {
    results = await search(term);
  }, 400);

  const addBook: (book: BookToAdd) => void = getContext("addBook");

  onMount(() => {
    inputRef.focus();
  });
</script>

<div class="red-book-search">
  <h1>Add Book</h1>

  {#if state === "search"}
    <input
      class="search"
      bind:this={inputRef}
      on:keyup={(event) => {
        // @ts-ignore
        const v = event.target.value;
        if (v && (v.length > 0 || v !== previousTerm)) {
          doSearch(v);
          previousTerm = v;
        }
      }}
    />

    <ol>
      {#each results as result}
        <li transition:slide>
          <BookResult
            result={result.volumeInfo}
            on:click={() => {
              state = "readthroughs";
              toAdd = result.volumeInfo;
            }}
          />
        </li>
      {/each}
    </ol>
  {:else if state === "readthroughs"}
    <BookResult result={toAdd} />
    <div class="red-add-status-container">
      <label for="status">Status</label>
      <select name="status" bind:value={readingStatus}>
        <option value="reading">Reading</option>
        <option value="to read">To Read</option>
        <option value="read">Read</option>
      </select>

      {#if readingStatus === "reading" || readingStatus === "read"}
        <p class="explanation">
          Choose {#if readingStatus === "read"}dates{:else}a date{/if} for when you
          started{#if readingStatus === "read"}
            and ended{/if} reading this book. {#if readingStatus === "read"}These
            dates{:else}This date{/if} will be inserted into your book template if
          it contains the &lbrace;&lbrace;readthrough&rbrace;&rbrace; token.
        </p>
        <div class="readthrough-picker">
          <label for="start">Start</label>
          <input name="start" type="date" bind:value={start} />
        </div>
      {/if}
      {#if readingStatus === "read"}
        <div>
          <label for="end">End</label>
          <input name="end" type="date" bind:value={end} />
        </div>
      {/if}
    </div>

    <div class="red-buttons">
      <button
        class="red-back-button"
        on:click={() => {
          state = "search";
          toAdd = null;
        }}>&lt; Back</button
      >

      <button
        class="mod-cta"
        on:click={() => {
          addBook({
            title: toAdd.title,
            subtitle: toAdd.subtitle,
            authors: toAdd.authors,
            isbn: getISBN(toAdd),
            cover: toAdd.imageLinks.thumbnail,
            readthroughs: [
              {
                start:
                  readingStatus === "read" || readingStatus === "reading"
                    ? start
                    : null,
                end: readingStatus === "read" ? end : null,
              },
            ],
            status: readingStatus,
          });
        }}>Add</button
      >
    </div>
  {/if}
</div>

<style>
  .red-book-search input.search {
    width: 100%;
  }

  ol {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    cursor: pointer;
    padding: 0;
    margin: 8px 0;
  }

  li:hover {
    background-color: var(--interactive-hover);
  }

  .red-add-status-container {
    margin-top: 16px;
  }

  .red-add-status-container label {
    font-weight: bold;
  }

  .explanation {
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .readthrough-picker {
    margin: 8px 0;
  }

  .red-buttons {
    display: flex;
    flex-direction: row;
    font-weight: bold;
    margin: 2rem 0;
  }

  .red-buttons .red-back-button {
    background-color: var(--background-secondary);
    color: var(--interactive-accent);
  }
</style>
