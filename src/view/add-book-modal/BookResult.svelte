<script lang="ts">
  import { SearchResult } from "src/services/book-search/google";

  export let result: SearchResult;
</script>

<div on:click>
  <div class="red-search-result">
    <div class="red-search-thumbnail">
      <img
        src={result.imageLinks?.smallThumbnail}
        alt={`${result.title} cover`}
      />
    </div>
    <div class="red-search-result-info">
      <p>{result.title}</p>
      {#if result.subtitle}
        <p>{result.subtitle}</p>
      {/if}
      <p>{result.authors ? result.authors.join(", ") : ""}</p>
    </div>
  </div>
</div>

<style>
  .red-search-result {
    display: flex;
    flex-direction: row;
  }

  .red-search-thumbnail {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
  }

  .red-search-thumbnail img {
    height: 100px;
    max-width: 80px;
  }

  .red-search-result-info {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
  }

  .red-search-result-info p {
    margin: 0;
    padding: 0;
  }
</style>
